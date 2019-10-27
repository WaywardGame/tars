define(["require", "exports", "utilities/Log", "../IObjective", "../Objectives/Core/ReserveItems", "../Utilities/Logger"], function (require, exports, Log_1, IObjective_1, ReserveItems_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plan {
        constructor(planner, context, objective, objectives) {
            this.planner = planner;
            this.context = context;
            this.log = Logger_1.createLog("Plan", objective.getHashCode());
            this.tree = this.createOptimizedExecutionTree(objective, objectives);
            this.objectives = this.flattenTree(this.tree);
            this.log.debug(`Execution tree for ${objective} (context: ${context.getHashCode()}).`);
        }
        async execute(preExecuteObjective, postExecuteObjective) {
            const chain = [];
            const objectiveStack = [...this.objectives];
            if (objectiveStack.length > 1) {
                this.log.info("Executing plan", objectiveStack.map(objectiveInfo => objectiveInfo.objective.getIdentifier()).join(" -> "));
            }
            let dynamic = false;
            while (true) {
                const objectiveInfo = objectiveStack.shift();
                if (objectiveInfo === undefined) {
                    break;
                }
                chain.push(objectiveInfo.objective);
                if (!preExecuteObjective()) {
                    return false;
                }
                let message = `Executing ${objectiveInfo.objective.getHashCode()}`;
                const contextHashCode = this.context.getHashCode();
                if (contextHashCode.length > 0) {
                    message += `. Context hash code: ${contextHashCode}`;
                }
                Logger_1.queueNextMessage(objectiveInfo.objective.log, message);
                if (objectiveInfo.logs.length > 0) {
                    for (const logLine of objectiveInfo.logs) {
                        const method = Log_1.LogLineType[logLine.type].toLowerCase();
                        const func = console[method];
                        if (func) {
                            func(...logLine.args);
                        }
                    }
                    Logger_1.processNextMessage();
                }
                const result = await objectiveInfo.objective.execute(this.context);
                if (result === IObjective_1.ObjectiveResult.Ignore) {
                    Logger_1.discardNextMessage();
                }
                else {
                    Logger_1.processNextMessage();
                }
                if (result === IObjective_1.ObjectiveResult.Pending) {
                    return chain;
                }
                if (result === IObjective_1.ObjectiveResult.Restart) {
                    return IObjective_1.ObjectiveResult.Restart;
                }
                if (!postExecuteObjective()) {
                    return false;
                }
                dynamic = dynamic || objectiveInfo.objective.isDynamic();
                if (dynamic) {
                    let resultObjectives = [];
                    if (Array.isArray(result)) {
                        if (Array.isArray(result[0])) {
                            const objectivePipeline = await this.planner.pickEasiestObjectivePipeline(this.context, result);
                            if (objectivePipeline.status === IObjective_1.CalculatedDifficultyStatus.Possible) {
                                resultObjectives = objectivePipeline.objectives;
                            }
                            else {
                                this.log.error("Invalid return value", objectiveInfo.objective.getHashCode(), objectivePipeline);
                                break;
                            }
                        }
                        else {
                            resultObjectives = result;
                        }
                    }
                    else if (typeof (result) !== "number") {
                        resultObjectives = [result];
                    }
                    if (resultObjectives.length > 0) {
                        objectiveStack.unshift(...resultObjectives.map(objective => ({
                            depth: -1,
                            objective: objective,
                            difficulty: -1,
                            logs: [],
                        })));
                    }
                }
            }
            return true;
        }
        flattenTree(root) {
            const objectives = [];
            const walkTree = (tree, depth, logs) => {
                if (tree.children.length === 0) {
                    objectives.push({
                        depth: depth,
                        objective: tree.objective,
                        difficulty: tree.difficulty,
                        logs: [...logs, ...tree.logs],
                    });
                }
                else {
                    for (let i = 0; i < tree.children.length; i++) {
                        const child = tree.children[i];
                        walkTree(child, depth + 1, i === 0 ? [...logs, ...tree.logs] : []);
                    }
                }
            };
            walkTree(root, 0, []);
            return objectives;
        }
        createExecutionTree(objective, objectives) {
            let id = 0;
            const tree = {
                id: id++,
                depth: 1,
                objective: objective,
                hashCode: objective.getHashCode(),
                difficulty: 0,
                logs: [],
                children: [],
            };
            const depthMap = new Map();
            depthMap.set(1, tree);
            for (const { depth, objective, difficulty, logs } of objectives) {
                const parent = depthMap.get(depth - 1);
                if (!parent) {
                    this.log.error(`Root objective: ${objective}`);
                    this.log.error("Objectives", objectives);
                    throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${objective.getHashCode()}`);
                }
                const childTree = {
                    id: id++,
                    depth: depth,
                    objective: objective,
                    hashCode: objective.getHashCode(),
                    difficulty: difficulty,
                    logs: logs,
                    children: [],
                    parent: parent,
                };
                parent.children.push(childTree);
                depthMap.set(depth, childTree);
            }
            return tree;
        }
        createOptimizedExecutionTree(objective, objectives) {
            let id = 0;
            const tree = {
                id: id++,
                depth: 0,
                objective: objective,
                hashCode: objective.getHashCode(),
                difficulty: 0,
                logs: [],
                children: [],
            };
            const objectiveGroups = new Map();
            const depthMap = new Map();
            depthMap.set(1, tree);
            const reserveItemObjectives = [];
            for (const { depth, objective, difficulty, logs } of objectives) {
                if (objective instanceof ReserveItems_1.default) {
                    reserveItemObjectives.push(objective);
                    continue;
                }
                const hashCode = objective.getHashCode();
                let parent = depthMap.get(depth - 1);
                if (!parent) {
                    this.log.error(`Root objective: ${objective}`);
                    this.log.error("Objectives", objectives);
                    throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${hashCode}`);
                }
                if (objective.canGroupTogether()) {
                    const objectiveGroupId = `${depth},${hashCode}`;
                    const objectiveGroupParent = objectiveGroups.get(objectiveGroupId);
                    if (objectiveGroupParent) {
                        parent = objectiveGroupParent;
                    }
                    else {
                        objectiveGroups.set(objectiveGroupId, parent);
                    }
                }
                const childTree = {
                    id: id++,
                    depth: depth,
                    objective: objective,
                    hashCode: hashCode,
                    difficulty: difficulty,
                    logs: logs,
                    children: [],
                    parent: parent,
                };
                parent.children.push(childTree);
                depthMap.set(depth, childTree);
            }
            const walkAndSortTree = (tree) => {
                tree.children = tree.children.sort((treeA, treeB) => {
                    if (treeA.objective.constructor === treeB.objective.constructor &&
                        treeA.objective.getName() === treeB.objective.getName() &&
                        treeA.objective.sort) {
                        return treeA.objective.sort(treeA, treeB);
                    }
                    return 0;
                });
                for (const child of tree.children) {
                    walkAndSortTree(child);
                }
            };
            walkAndSortTree(tree);
            tree.children.unshift(...reserveItemObjectives.map(objective => ({
                id: id++,
                depth: 1,
                objective: objective,
                hashCode: objective.getHashCode(),
                difficulty: 0,
                logs: [],
                children: [],
            })));
            return tree;
        }
        getTreeString(root) {
            let str = "";
            const writeTree = (tree, depth = 0) => {
                str += `${"  ".repeat(depth)}${tree.hashCode}\n`;
                for (const child of tree.children) {
                    writeTree(child, depth + 1);
                }
            };
            writeTree(root, 0);
            return str;
        }
    }
    exports.default = Plan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db3JlL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsSUFBSTtRQWN4QixZQUE2QixPQUFpQixFQUFtQixPQUFnQixFQUFFLFNBQXFCLEVBQUUsVUFBNEI7WUFBekcsWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ2hGLElBQUksQ0FBQyxHQUFHLEdBQUcsa0JBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFHdEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXJFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFHOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLFNBQVMsY0FBYyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFNTSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFrQyxFQUFFLG9CQUFtQztZQUMzRixNQUFNLEtBQUssR0FBaUIsRUFBRSxDQUFDO1lBQy9CLE1BQU0sY0FBYyxHQUFxQixDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTlELElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDM0g7WUFFRCxJQUFJLE9B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
define(["require", "exports", "../IObjective", "../Objectives/Core/ReserveItems", "../Objectives/Core/Restart", "../Utilities/Logger", "./IPlan"], function (require, exports, IObjective_1, ReserveItems_1, Restart_1, Logger_1, IPlan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plan {
        constructor(planner, context, objectiveInfo, objectives) {
            this.planner = planner;
            this.context = context;
            this.objectiveInfo = objectiveInfo;
            this.log = Logger_1.createLog("Plan", objectiveInfo.objective.getHashCode());
            this.tree = this.createOptimizedExecutionTree(objectiveInfo.objective, objectives);
            this.objectives = this.flattenTree(this.tree);
            this.log.debug(`Execution tree for ${objectiveInfo.objective} (context: ${context.getHashCode()}).`, this.getTreeString(this.tree));
        }
        getTreeString(root = this.tree) {
            let str = "";
            const writeTree = (tree, depth = 0) => {
                str += `${"  ".repeat(depth)}${tree === null || tree === void 0 ? void 0 : tree.hashCode}\n`;
                for (const child of tree === null || tree === void 0 ? void 0 : tree.children) {
                    writeTree(child, depth + 1);
                }
            };
            writeTree(root, 0);
            return str;
        }
        async execute(preExecuteObjective, postExecuteObjective) {
            const chain = [];
            const objectiveStack = [...this.objectives];
            if (objectiveStack.length > 1) {
                this.log.info("Executing plan", objectiveStack.map(objectiveInfo => objectiveInfo.objective.getIdentifier()).join(" -> "));
                if (this.objectiveInfo.objective !== objectiveStack[0].objective) {
                    for (const log of this.objectiveInfo.logs) {
                        Logger_1.queueMessage(log.type, log.args);
                    }
                }
            }
            let dynamic = false;
            while (true) {
                const objectiveInfo = objectiveStack.shift();
                if (objectiveInfo === undefined) {
                    Logger_1.discardQueuedMessages();
                    break;
                }
                chain.push(objectiveInfo.objective);
                const preExecuteObjectiveResult = preExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo));
                if (preExecuteObjectiveResult !== undefined) {
                    Logger_1.discardQueuedMessages();
                    return preExecuteObjectiveResult;
                }
                let message = `Executing ${objectiveInfo.objective.getHashCode()}`;
                const contextHashCode = this.context.getHashCode();
                if (contextHashCode.length > 0) {
                    message += `. Context hash code: ${contextHashCode}`;
                }
                Logger_1.queueMessage(objectiveInfo.objective.log, [message]);
                for (const log of objectiveInfo.logs) {
                    Logger_1.queueMessage(log.type, log.args);
                }
                const result = await objectiveInfo.objective.execute(this.context);
                if (result === IObjective_1.ObjectiveResult.Ignore) {
                    Logger_1.discardQueuedMessages();
                }
                else {
                    Logger_1.processQueuedMessages();
                }
                if (result === IObjective_1.ObjectiveResult.Pending) {
                    return {
                        type: IPlan_1.ExecuteResultType.Pending,
                        objectives: this.getObjectiveResults(chain, objectiveStack, objectiveInfo),
                    };
                }
                if (result === IObjective_1.ObjectiveResult.Restart) {
                    return {
                        type: IPlan_1.ExecuteResultType.Restart,
                    };
                }
                const postExecuteObjectiveResult = postExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo, false));
                if (postExecuteObjectiveResult !== undefined) {
                    return postExecuteObjectiveResult;
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
            return {
                type: IPlan_1.ExecuteResultType.Completed,
            };
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
            const reserveItemObjectives = new Map();
            for (const { depth, objective, difficulty, logs } of objectives) {
                const hashCode = objective.getHashCode();
                if (objective instanceof ReserveItems_1.default) {
                    if (!reserveItemObjectives.has(hashCode)) {
                        reserveItemObjectives.set(hashCode, objective.items);
                    }
                    continue;
                }
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
                    if (treeA.objective.sort && treeB.objective.sort) {
                        return treeA.objective.sort(this.context, treeA, treeB);
                    }
                    return 0;
                });
                for (const child of tree.children) {
                    walkAndSortTree(child);
                }
            };
            walkAndSortTree(tree);
            if (reserveItemObjectives.size > 0) {
                const reserveItemObjective = new ReserveItems_1.default();
                reserveItemObjective.items = Array.from(reserveItemObjectives)
                    .sort(([a], [b]) => { var _a, _b; return a.localeCompare(b, (_b = (_a = navigator === null || navigator === void 0 ? void 0 : navigator.languages) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : navigator.language, { numeric: true, ignorePunctuation: true }); })
                    .map(a => a[1])
                    .flat();
                const reserveItemObjectiveTree = {
                    id: id++,
                    depth: 1,
                    objective: reserveItemObjective,
                    hashCode: reserveItemObjective.getHashCode(),
                    difficulty: 0,
                    logs: [],
                    children: [],
                };
                const children = [reserveItemObjectiveTree].concat(tree.children);
                tree.children = children;
            }
            return tree;
        }
        getObjectiveResults(chain = [], objectiveStack, currentObjectiveInfo, includeCurrent = true) {
            const objectiveResult = chain.find(objective => !objective.canSaveChildObjectives());
            if (objectiveResult) {
                return [objectiveResult];
            }
            const results = includeCurrent ? [currentObjectiveInfo.objective] : [];
            let offset = 0;
            while (true) {
                const nextObjectiveInfo = objectiveStack[offset];
                if (!nextObjectiveInfo) {
                    break;
                }
                if (nextObjectiveInfo.depth < currentObjectiveInfo.depth) {
                    results.push(new Restart_1.default().setStatus("Determining objective..."));
                    break;
                }
                results.push(nextObjectiveInfo.objective);
                offset++;
            }
            return results;
        }
    }
    exports.default = Plan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db3JlL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsSUFBSTtRQWN4QixZQUE2QixPQUFpQixFQUFtQixPQUFnQixFQUFtQixhQUE2QixFQUFFLFVBQTRCO1lBQWxJLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUFtQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDaEksSUFBSSxDQUFDLEdBQUcsR0FBRyxrQkFBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFHcEUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVuRixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBSzlDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixhQUFhLENBQUMsU0FBUyxjQUFjLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQUtNLGFBQWEsQ0FBQyxPQUF1QixJQUFJLENBQUMsSUFBSTtZQUNwRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFFYixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQW9CLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUNyRCxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxRQUFRLElBQUksQ0FBQztnQkFFbEQsS0FBSyxNQUFN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
define(["require", "exports", "../objective/IObjective", "../../objectives/core/ReserveItems", "../../objectives/core/Restart", "./IPlan"], function (require, exports, IObjective_1, ReserveItems_1, Restart_1, IPlan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plan {
        constructor(planner, context, objectiveInfo, objectives) {
            this.planner = planner;
            this.context = context;
            this.objectiveInfo = objectiveInfo;
            this.log = context.utilities.logger.createLog("Plan", objectiveInfo.objective.getHashCode(context));
            this.tree = this.createOptimizedExecutionTreeV2(context, objectiveInfo.objective, objectives);
            this.objectives = this.processTree(this.tree);
            this.log.debug(`Execution tree for ${objectiveInfo.objective} (context: ${context.getHashCode()}).`, this.getTreeString(this.tree));
        }
        static getPipelineString(context, objectives, cacheHashcodes = true) {
            return objectives ?
                objectives.map(objective => {
                    if (Array.isArray(objective)) {
                        return Plan.getPipelineString(context, objective, cacheHashcodes);
                    }
                    if (cacheHashcodes) {
                        if (!objective.cachedHashCode) {
                            objective.cachedHashCode = objective.getHashCode(context);
                        }
                        return objective.cachedHashCode;
                    }
                    return objective.getHashCode(context);
                }).join(" -> ") :
                "Empty pipeline";
        }
        getTreeString(root = this.tree) {
            let str = "";
            const writeTree = (tree, depth = 0) => {
                str += `${"  ".repeat(depth)}${tree.hashCode}`;
                if (tree.groupedAway) {
                    str += " (Regrouped children)";
                }
                str += "\n";
                for (const child of tree.children) {
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
                this.log.info("Executing plan", Plan.getPipelineString(this.context, objectiveStack.map(objectiveInfo => objectiveInfo.objective)));
                if (this.objectiveInfo.objective !== objectiveStack[0].objective) {
                    for (const log of this.objectiveInfo.logs) {
                        this.context.utilities.logger.queueMessage(log.type, log.args);
                    }
                }
            }
            let dynamic = false;
            let ignored = false;
            while (true) {
                const objectiveInfo = objectiveStack.shift();
                if (objectiveInfo === undefined) {
                    this.context.utilities.logger.discardQueuedMessages();
                    break;
                }
                chain.push(objectiveInfo.objective);
                const preExecuteObjectiveResult = preExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo));
                if (preExecuteObjectiveResult !== undefined) {
                    this.context.utilities.logger.discardQueuedMessages();
                    return preExecuteObjectiveResult;
                }
                let message = `Executing ${objectiveInfo.objective.getHashCode(this.context)} [${objectiveInfo.objective.getStatusMessage(this.context)}]`;
                const contextHashCode = this.context.getHashCode();
                if (contextHashCode.length > 0) {
                    message += `. Context hash code: ${contextHashCode}`;
                }
                objectiveInfo.objective.ensureLogger(this.context.utilities.logger);
                this.context.utilities.logger.queueMessage(objectiveInfo.objective.log, [message]);
                for (const log of objectiveInfo.logs) {
                    this.context.utilities.logger.queueMessage(log.type, log.args);
                }
                const result = await objectiveInfo.objective.execute(this.context, objectiveInfo.objective.getHashCode(this.context));
                if (result === IObjective_1.ObjectiveResult.Ignore) {
                    this.context.utilities.logger.discardQueuedMessages();
                }
                else {
                    this.context.utilities.logger.processQueuedMessages();
                }
                if (result === IObjective_1.ObjectiveResult.Pending) {
                    const objectiveResults = this.getObjectiveResults(chain, objectiveStack, objectiveInfo);
                    return {
                        type: IPlan_1.ExecuteResultType.Pending,
                        objectives: objectiveResults,
                    };
                }
                if (result === IObjective_1.ObjectiveResult.Restart) {
                    return {
                        type: IPlan_1.ExecuteResultType.Restart,
                    };
                }
                if (result === IObjective_1.ObjectiveResult.Ignore) {
                    ignored = true;
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
                                this.log.warn(`Invalid return value for ${objectiveInfo.objective.getHashCode(this.context)}. status: ${objectivePipeline.status}`);
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
                type: ignored ? IPlan_1.ExecuteResultType.Ignored : IPlan_1.ExecuteResultType.Completed,
            };
        }
        processTree(root) {
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
                        tree.objective.ensureLogger(this.context.utilities.logger);
                        walkTree(child, depth + 1, i === 0 ? [...logs, ...tree.logs] : []);
                    }
                }
            };
            walkTree(root, 0, []);
            for (const objectiveInfo of objectives) {
                objectiveInfo.objective.ensureLogger(this.context.utilities.logger);
            }
            return objectives;
        }
        createOptimizedExecutionTreeV2(context, objective, objectives) {
            let id = 0;
            const rootTree = {
                id: id++,
                depth: 0,
                objective: objective,
                hashCode: objective.getHashCode(context),
                difficulty: 0,
                logs: [],
                children: [],
            };
            const objectiveGroups = new Map();
            const depthMap = new Map();
            depthMap.set(1, rootTree);
            const gatherObjectiveTrees = [];
            const reserveItemObjectives = new Map();
            const keepInInventoryReserveItemObjectives = new Map();
            for (const { depth, objective, difficulty, logs } of objectives) {
                const hashCode = objective.getHashCode(context);
                if (objective instanceof ReserveItems_1.default) {
                    const map = objective.shouldKeepInInventory() ? keepInInventoryReserveItemObjectives : reserveItemObjectives;
                    for (const item of objective.items) {
                        map.set(item, (map.get(item) ?? 0) + 1);
                    }
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
                        parent.groupedAway = true;
                        parent = objectiveGroupParent;
                    }
                    else {
                        objectiveGroups.set(objectiveGroupId, parent);
                    }
                }
                const childTree = {
                    id: id++,
                    depth,
                    objective,
                    hashCode,
                    difficulty,
                    logs,
                    parent,
                    children: [],
                };
                parent.children.push(childTree);
                depthMap.set(depth, childTree);
                if (objective.gatherObjectivePriority !== undefined) {
                    gatherObjectiveTrees.push(childTree);
                }
            }
            const cachedExecutionPriorities = new Map();
            const getExecutionPriority = (objective, tree) => {
                const hashCode = objective.getHashCode(context);
                let objectivePriorities = cachedExecutionPriorities.get(hashCode);
                if (!objectivePriorities) {
                    objectivePriorities = new Map();
                    cachedExecutionPriorities.set(hashCode, objectivePriorities);
                }
                let priority = objectivePriorities.get(tree);
                if (priority === undefined) {
                    priority = objective.getExecutionPriority(this.context, tree).priority;
                    objectivePriorities.set(tree, priority);
                }
                return priority;
            };
            const walkAndSortTree = (tree) => {
                tree.children = tree.children.sort((treeA, treeB) => {
                    const objectiveA = treeA.objective;
                    const objectiveB = treeB.objective;
                    if (objectiveA.getExecutionPriority && objectiveB.getExecutionPriority) {
                        const priorityA = getExecutionPriority(objectiveA, treeA);
                        const priorityB = getExecutionPriority(objectiveB, treeB);
                        return priorityA === priorityB ? 0 : priorityA < priorityB ? 1 : -1;
                    }
                    return 0;
                });
                for (const child of tree.children) {
                    walkAndSortTree(child);
                }
            };
            walkAndSortTree(rootTree);
            let objectivesToInsertAtFront = [];
            if (reserveItemObjectives.size > 0) {
                const reserveItemObjective = new ReserveItems_1.default();
                reserveItemObjective.items = Array.from(reserveItemObjectives)
                    .sort(([a], [b]) => a.toString().localeCompare(b.toString(), navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
                    .map(a => a[0])
                    .flat();
                objectivesToInsertAtFront.push({
                    id: id++,
                    depth: 1,
                    objective: reserveItemObjective,
                    hashCode: reserveItemObjective.getHashCode(context),
                    difficulty: 0,
                    logs: [],
                    children: [],
                });
            }
            if (keepInInventoryReserveItemObjectives.size > 0) {
                const reserveItemObjective = new ReserveItems_1.default().keepInInventory();
                reserveItemObjective.items = Array.from(keepInInventoryReserveItemObjectives)
                    .sort(([a], [b]) => a.toString().localeCompare(b.toString(), navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
                    .map(a => a[0])
                    .flat();
                objectivesToInsertAtFront.push({
                    id: id++,
                    depth: 1,
                    objective: reserveItemObjective,
                    hashCode: reserveItemObjective.getHashCode(context),
                    difficulty: 0,
                    logs: [],
                    children: [],
                });
            }
            if (objectivesToInsertAtFront.length > 0) {
                rootTree.children = objectivesToInsertAtFront.concat(rootTree.children);
            }
            return rootTree;
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
                    results.push(new Restart_1.default().setStatus("Calculating objective..."));
                    break;
                }
                results.push(nextObjectiveInfo.objective);
                offset++;
            }
            return results;
        }
        getExecutionTreePosition(tree) {
            const position = tree.objective.getPosition?.();
            if (position !== undefined) {
                return position;
            }
            for (const child of tree.children) {
                const position = child.objective.getPosition?.();
                if (position !== undefined) {
                    return position;
                }
            }
            for (const child of tree.children) {
                for (const child2 of child.children) {
                    const position = this.getExecutionTreePosition(child2);
                    if (position !== undefined) {
                        return position;
                    }
                }
            }
            return undefined;
        }
    }
    exports.default = Plan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLElBQUk7UUFvQ3hCLFlBQTZCLE9BQWlCLEVBQW1CLE9BQWdCLEVBQW1CLGFBQTZCLEVBQUUsVUFBNEI7WUFBbEksWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNoSSxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUlwRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5RixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBSzlDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixhQUFhLENBQUMsU0FBUyxjQUFjLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQW5DTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBZ0IsRUFBRSxVQUF3RCxFQUFFLGlCQUEwQixJQUFJO1lBR3pJLE9BQU8sVUFBVSxDQUFDLENBQUM7Z0JBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQzFCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDN0Is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
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
                str += `${"  ".repeat(depth)}${tree.hashCode} (${tree.id})`;
                str += ` (Difficulty is ${tree.difficulty})`;
                if (tree.priority !== undefined) {
                    str += ` (${tree.priority.gatherObjectives} gather objectives, ${tree.priority.gatherFromChestObjectives} chest gather objectives, ${tree.priority.craftObjectives} craft objectives)`;
                }
                if (tree.groupParent) {
                    str += " (Group parent)";
                }
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
                if (tree.children.length === 0 || tree.objective.isDynamic()) {
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
                        parent.groupedAway = objectiveGroupParent;
                        parent = objectiveGroupParent;
                    }
                    else {
                        parent.groupParent = true;
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
                    priority = objective.getExecutionPriority(this.context, tree);
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
                        treeA.priority = priorityA;
                        treeB.priority = priorityB;
                        const gatherFromCreatureObjectivesA = priorityA.gatherFromCreatureObjectives;
                        const gatherFromCreatureObjectivesB = priorityB.gatherFromCreatureObjectives;
                        if (gatherFromCreatureObjectivesA !== gatherFromCreatureObjectivesB) {
                            return gatherFromCreatureObjectivesB - gatherFromCreatureObjectivesA;
                        }
                        const nonChestGatherObjectivesA = priorityA.gatherObjectives - priorityA.gatherFromChestObjectives;
                        const nonChestGatherObjectivesB = priorityB.gatherObjectives - priorityB.gatherFromChestObjectives;
                        if (nonChestGatherObjectivesA !== nonChestGatherObjectivesB) {
                            return nonChestGatherObjectivesB - nonChestGatherObjectivesA;
                        }
                        if ((priorityA.craftObjectives > 0 && priorityA.gatherObjectives === 0) ||
                            (priorityB.craftObjectives > 0 && priorityB.gatherObjectives === 0)) {
                            return priorityA.gatherObjectives - priorityB.gatherObjectives;
                        }
                        const craftObjectivesA = priorityA.craftObjectives;
                        const craftObjectivesB = priorityB.craftObjectives;
                        if (craftObjectivesA !== craftObjectivesB) {
                            return craftObjectivesB - craftObjectivesA;
                        }
                        return priorityB.gatherObjectives - priorityA.gatherObjectives;
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
            const groupsSeen = new Set();
            const walkAndRegroupTree = (tree) => {
                if (tree.groupedAway) {
                    if (!groupsSeen.has(tree.groupedAway.id)) {
                        groupsSeen.add(tree.groupedAway.id);
                        tree.children = tree.groupedAway.children;
                    }
                }
                else if (tree.groupParent) {
                    if (!groupsSeen.has(tree.id)) {
                        groupsSeen.add(tree.id);
                    }
                    else {
                        tree.children = [];
                    }
                }
                for (const child of tree.children) {
                    walkAndRegroupTree(child);
                }
            };
            walkAndRegroupTree(rootTree);
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
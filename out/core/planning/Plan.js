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
                    str += " (";
                    str += `${tree.priority.readyToCraftObjectives} ready to craft objectives`;
                    str += `, ${tree.priority.totalCraftObjectives} total craft objectives`;
                    str += `, ${tree.priority.useProvidedItemObjectives} use provided item objectives`;
                    str += `, ${tree.priority.totalGatherObjectives} gather objectives`;
                    if (tree.priority.totalGatherObjectives > 0) {
                        str += `, ${Object.keys(tree.priority.gatherObjectives).filter(key => tree.priority.gatherObjectives[key] > 0).map(key => `${key}=${tree.priority.gatherObjectives[key]}`).join(", ")}`;
                    }
                    str += ")";
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
                        const gatherFromCorpsesObjectivesA = priorityA.gatherObjectives.GatherFromCorpse;
                        const gatherFromCorpsesObjectivesB = priorityB.gatherObjectives.GatherFromCorpse;
                        if (gatherFromCorpsesObjectivesA !== gatherFromCorpsesObjectivesB) {
                            return gatherFromCorpsesObjectivesB - gatherFromCorpsesObjectivesA;
                        }
                        const gatherFromCreatureObjectivesA = priorityA.gatherObjectives.GatherFromCreature;
                        const gatherFromCreatureObjectivesB = priorityB.gatherObjectives.GatherFromCreature;
                        ;
                        if (gatherFromCreatureObjectivesA !== gatherFromCreatureObjectivesB) {
                            return gatherFromCreatureObjectivesB - gatherFromCreatureObjectivesA;
                        }
                        const gatherFromTerrainResourceObjectivesA = priorityA.gatherObjectives.GatherFromTerrainResource;
                        const gatherFromTerrainResourceObjectivesB = priorityB.gatherObjectives.GatherFromTerrainResource;
                        if (gatherFromTerrainResourceObjectivesA !== gatherFromTerrainResourceObjectivesB) {
                            return gatherFromTerrainResourceObjectivesB - gatherFromTerrainResourceObjectivesA;
                        }
                        if (priorityA.readyToCraftObjectives > 0 || priorityB.readyToCraftObjectives > 0) {
                            const result = priorityB.readyToCraftObjectives - priorityA.readyToCraftObjectives;
                            if (result === 0) {
                                return treeA.difficulty - treeB.difficulty;
                            }
                            return result;
                        }
                        const nonChestGatherObjectivesA = priorityA.totalGatherObjectives - priorityA.gatherObjectives.GatherFromChest;
                        const nonChestGatherObjectivesB = priorityB.totalGatherObjectives - priorityB.gatherObjectives.GatherFromChest;
                        if (nonChestGatherObjectivesA !== nonChestGatherObjectivesB) {
                            return nonChestGatherObjectivesB - nonChestGatherObjectivesA;
                        }
                        if (priorityA.useProvidedItemObjectives > 0 || priorityB.useProvidedItemObjectives > 0) {
                            const result = priorityA.useProvidedItemObjectives - priorityB.useProvidedItemObjectives;
                            if (result === 0) {
                                return treeA.difficulty - treeB.difficulty;
                            }
                            return result;
                        }
                        const craftObjectivesA = priorityA.totalCraftObjectives;
                        const craftObjectivesB = priorityB.totalCraftObjectives;
                        if (craftObjectivesA > 0 || craftObjectivesB > 0) {
                            const result = craftObjectivesB - craftObjectivesA;
                            if (result === 0) {
                                return treeA.difficulty - treeB.difficulty;
                            }
                            return result;
                        }
                        return treeA.difficulty - treeB.difficulty;
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
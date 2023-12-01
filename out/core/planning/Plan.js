/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "../objective/IObjective", "../../objectives/core/ReserveItems", "../../objectives/core/Restart", "./IPlan"], function (require, exports, IObjective_1, ReserveItems_1, Restart_1, IPlan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plan {
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
        constructor(planner, context, objectiveInfo, objectives) {
            this.planner = planner;
            this.context = context;
            this.objectiveInfo = objectiveInfo;
            this.log = context.utilities.logger.createLog("Plan", objectiveInfo.objective.getHashCode(context));
            this.tree = this.createOptimizedExecutionTreeV2(context, objectiveInfo.objective, objectives);
            this.objectives = this.processTree(this.tree);
            this.log.debug(`Execution tree for ${objectiveInfo.objective} (context: ${context.getHashCode()}).`, this.getTreeString(this.tree));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNEJILE1BQXFCLElBQUk7UUFjakIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsVUFBd0QsRUFBRSxpQkFBMEIsSUFBSTtZQUd6SSxPQUFPLFVBQVUsQ0FBQyxDQUFDO2dCQUNsQixVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3QkFDOUIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDbkUsQ0FBQztvQkFFRCxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNwQixJQUFJLENBQUUsU0FBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDdkMsU0FBaUIsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDcEUsQ0FBQzt3QkFFRCxPQUFRLFNBQWlCLENBQUMsY0FBYyxDQUFDO29CQUMxQyxDQUFDO29CQUVELE9BQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLGdCQUFnQixDQUFDO1FBQ25CLENBQUM7UUFFRCxZQUE2QixPQUFpQixFQUFtQixPQUFnQixFQUFtQixhQUE2QixFQUFFLFVBQTRCO1lBQWxJLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUFtQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDaEksSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENB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
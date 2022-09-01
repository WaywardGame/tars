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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLElBQUk7UUFvQ3hCLFlBQTZCLE9BQWlCLEVBQW1CLE9BQWdCLEVBQW1CLGFBQTZCLEVBQUUsVUFBNEI7WUFBbEksWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNoSSxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUlwRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5RixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBSzlDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixhQUFhLENBQUMsU0FBUyxjQUFjLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQW5DTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBZ0IsRUFBRSxVQUF3RCxFQUFFLGlCQUEwQixJQUFJO1lBR3pJLE9BQU8sVUFBVSxDQUFDLENBQUM7Z0JBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQzFCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDN0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztxQkFDbEU7b0JBRUQsSUFBSSxjQUFjLEVBQUU7d0JBQ25CLElBQUksQ0FBRSxTQUFpQixDQUFDLGNBQWMsRUFBRTs0QkFDdEMsU0FBaUIsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt5QkFDbkU7d0JBRUQsT0FBUSxTQUFpQixDQUFDLGNBQWMsQ0FBQztxQkFDekM7b0JBRUQsT0FBTyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDakIsZ0JBQWdCLENBQUM7UUFDbkIsQ0FBQztRQW9CTSxhQUFhLENBQUMsT0FBdUIsSUFBSSxDQUFDLElBQUk7WUFDcEQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBRWIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFvQixFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFDckQsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztnQkFFNUQsR0FBRyxJQUFJLG1CQUFtQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBRTdDLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLEdBQUcsSUFBSSxJQUFJLENBQUM7b0JBQ1osR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsNEJBQTRCLENBQUM7b0JBQzNFLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLHlCQUF5QixDQUFDO29CQUV4RSxHQUFHLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixvQkFBb0IsQ0FBQztvQkFDcEUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixHQUFHLENBQUMsRUFBRTt3QkFDNUMsR0FBRyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUUsSUFBSSxDQUFDLFFBQVMsQ0FBQyxnQkFBd0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSyxJQUFJLENBQUMsUUFBUyxDQUFDLGdCQUF3QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztxQkFDNU07b0JBRUQsR0FBRyxJQUFJLEdBQUcsQ0FBQztpQkFDWDtnQkFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ3JCLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQztpQkFDekI7Z0JBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNyQixHQUFHLElBQUksdUJBQXVCLENBQUM7aUJBQy9CO2dCQUVELEdBQUcsSUFBSSxJQUFJLENBQUM7Z0JBRVosS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNsQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDNUI7WUFDRixDQUFDLENBQUM7WUFFRixTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5CLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQU9NLEtBQUssQ0FBQyxPQUFPLENBQ25CLG1CQUEyRixFQUMzRixvQkFBNEY7WUFDNUYsTUFBTSxLQUFLLEdBQWlCLEVBQUUsQ0FBQztZQUMvQixNQUFNLGNBQWMsR0FBcUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU5RCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO29CQUVqRSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO3dCQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMvRDtpQkFDRDthQUNEO1lBSUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUVwQixPQUFPLElBQUksRUFBRTtnQkFDWixNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzdDLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQ3RELE1BQU07aUJBQ047Z0JBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXBDLE1BQU0seUJBQXlCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDNUgsSUFBSSx5QkFBeUIsS0FBSyxTQUFTLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO29CQUN0RCxPQUFPLHlCQUF5QixDQUFDO2lCQUNqQztnQkFHRCxJQUFJLE9BQU8sR0FBRyxhQUFhLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxhQUFhLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUUzSSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMvQixPQUFPLElBQUksd0JBQXdCLGVBQWUsRUFBRSxDQUFDO2lCQUNyRDtnQkFFRCxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLEtBQUssTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtvQkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDL0Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUV0SCxJQUFJLE1BQU0sS0FBSyw0QkFBZSxDQUFDLE1BQU0sRUFBRTtvQkFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7aUJBRXREO3FCQUFNO29CQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2lCQUN0RDtnQkFFRCxJQUFJLE1BQU0sS0FBSyw0QkFBZSxDQUFDLE9BQU8sRUFBRTtvQkFDdkMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFVeEYsT0FBTzt3QkFDTixJQUFJLEVBQUUseUJBQWlCLENBQUMsT0FBTzt3QkFDL0IsVUFBVSxFQUFFLGdCQUFnQjtxQkFDNUIsQ0FBQztpQkFDRjtnQkFFRCxJQUFJLE1BQU0sS0FBSyw0QkFBZSxDQUFDLE9BQU8sRUFBRTtvQkFDdkMsT0FBTzt3QkFDTixJQUFJLEVBQUUseUJBQWlCLENBQUMsT0FBTztxQkFDL0IsQ0FBQztpQkFDRjtnQkFFRCxJQUFJLE1BQU0sS0FBSyw0QkFBZSxDQUFDLE1BQU0sRUFBRTtvQkFDdEMsT0FBTyxHQUFHLElBQUksQ0FBQztpQkFDZjtnQkFHRCxNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNySSxJQUFJLDBCQUEwQixLQUFLLFNBQVMsRUFBRTtvQkFDN0MsT0FBTywwQkFBMEIsQ0FBQztpQkFDbEM7Z0JBR0QsT0FBTyxHQUFHLE9BQU8sSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUV6RCxJQUFJLE9BQU8sRUFBRTtvQkFDWixJQUFJLGdCQUFnQixHQUFpQixFQUFFLENBQUM7b0JBRXhDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUM3QixNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQXdCLENBQUMsQ0FBQzs0QkFDbEgsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssdUNBQTBCLENBQUMsUUFBUSxFQUFFO2dDQUNyRSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7NkJBRWhEO2lDQUFNO2dDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQ0FDcEksTUFBTTs2QkFDTjt5QkFFRDs2QkFBTTs0QkFDTixnQkFBZ0IsR0FBSSxNQUF1QixDQUFDO3lCQUM1QztxQkFFRDt5QkFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxRQUFRLEVBQUU7d0JBQ3hDLGdCQUFnQixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQzVCO29CQUVELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDaEMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQzVELEtBQUssRUFBRSxDQUFDLENBQUM7NEJBQ1QsU0FBUyxFQUFFLFNBQVM7NEJBQ3BCLFVBQVUsRUFBRSxDQUFDLENBQUM7NEJBQ2QsSUFBSSxFQUFFLEVBQUU7eUJBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDTDtpQkFDRDthQWVEO1lBT0QsT0FBTztnQkFDTixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLFNBQVM7YUFDdkUsQ0FBQztRQUNILENBQUM7UUFFTyxXQUFXLENBQUMsSUFBb0I7WUFDdkMsTUFBTSxVQUFVLEdBQXFCLEVBQUUsQ0FBQztZQUV4QyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQW9CLEVBQUUsS0FBYSxFQUFFLElBQWdCLEVBQUUsRUFBRTtnQkFDMUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDN0QsVUFBVSxDQUFDLElBQUksQ0FBQzt3QkFDZixLQUFLLEVBQUUsS0FBSzt3QkFDWixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7d0JBQ3pCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTt3QkFDM0IsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO3FCQUM3QixDQUFDLENBQUM7aUJBRUg7cUJBQU07b0JBQ04sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDM0QsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNuRTtpQkFDRDtZQUNGLENBQUMsQ0FBQztZQUVGLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXRCLEtBQUssTUFBTSxhQUFhLElBQUksVUFBVSxFQUFFO2dCQUN2QyxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNwRTtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFpT08sOEJBQThCLENBQUMsT0FBZ0IsRUFBRSxTQUFxQixFQUFFLFVBQTRCO1lBQzNHLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVYLE1BQU0sUUFBUSxHQUFtQjtnQkFDaEMsRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDUixLQUFLLEVBQUUsQ0FBQztnQkFDUixTQUFTLEVBQUUsU0FBUztnQkFDcEIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUN4QyxVQUFVLEVBQUUsQ0FBQztnQkFDYixJQUFJLEVBQUUsRUFBRTtnQkFDUixRQUFRLEVBQUUsRUFBRTthQUNaLENBQUM7WUFFRixNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztZQUUxRCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztZQUNuRCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUxQixNQUFNLG9CQUFvQixHQUFxQixFQUFFLENBQUM7WUFDbEQsTUFBTSxxQkFBcUIsR0FBc0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzRCxNQUFNLG9DQUFvQyxHQUFzQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBSTFFLEtBQUssTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLFVBQVUsRUFBRTtnQkFDaEUsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxTQUFTLFlBQVksc0JBQVksRUFBRTtvQkFDdEMsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFFN0csS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO3dCQUNuQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3hDO2lCQUlEO2dCQUVELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBRXpDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEtBQUssR0FBRyxDQUFDLGdCQUFnQixRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUM1RTtnQkFFRCxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO29CQUVqQyxNQUFNLGdCQUFnQixHQUFHLEdBQUcsS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNoRCxNQUFNLG9CQUFvQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDbkUsSUFBSSxvQkFBb0IsRUFBRTt3QkFHekIsTUFBTSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQzt3QkFDMUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDO3FCQUU5Qjt5QkFBTTt3QkFDTixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDMUIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDOUM7aUJBQ0Q7Z0JBRUQsTUFBTSxTQUFTLEdBQW1CO29CQUNqQyxFQUFFLEVBQUUsRUFBRSxFQUFFO29CQUNSLEtBQUs7b0JBQ0wsU0FBUztvQkFDVCxRQUFRO29CQUNSLFVBQVU7b0JBQ1YsSUFBSTtvQkFDSixNQUFNO29CQUNOLFFBQVEsRUFBRSxFQUFFO2lCQUNaLENBQUM7Z0JBRUYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRWhDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUUvQixJQUFJLFNBQVMsQ0FBQyx1QkFBdUIsS0FBSyxTQUFTLEVBQUU7b0JBQ3BELG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDckM7YUFDRDtZQUVELE1BQU0seUJBQXlCLEdBQXlELElBQUksR0FBRyxFQUFFLENBQUM7WUFFbEcsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFNBQXFCLEVBQUUsSUFBb0IsRUFBRSxFQUFFO2dCQUM1RSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVoRCxJQUFJLG1CQUFtQixHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO29CQUN6QixtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNoQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLENBQUM7aUJBQzdEO2dCQUVELElBQUksUUFBUSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUMzQixRQUFRLEdBQUcsU0FBUyxDQUFDLG9CQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQy9ELG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3hDO2dCQUVELE9BQU8sUUFBUSxDQUFDO1lBQ2pCLENBQUMsQ0FBQTtZQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBb0IsRUFBRSxFQUFFO2dCQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNuRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNuQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNuQyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsSUFBSSxVQUFVLENBQUMsb0JBQW9CLEVBQUU7d0JBQ3ZFLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDMUQsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUUxRCxLQUFLLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQzt3QkFDM0IsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7d0JBRTNCLE1BQU0sNEJBQTRCLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO3dCQUNqRixNQUFNLDRCQUE0QixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDakYsSUFBSSw0QkFBNEIsS0FBSyw0QkFBNEIsRUFBRTs0QkFFbEUsT0FBTyw0QkFBNEIsR0FBRyw0QkFBNEIsQ0FBQzt5QkFDbkU7d0JBRUQsTUFBTSw2QkFBNkIsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUM7d0JBQ3BGLE1BQU0sNkJBQTZCLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDO3dCQUFBLENBQUM7d0JBQ3JGLElBQUksNkJBQTZCLEtBQUssNkJBQTZCLEVBQUU7NEJBRXBFLE9BQU8sNkJBQTZCLEdBQUcsNkJBQTZCLENBQUM7eUJBQ3JFO3dCQUVELE1BQU0sb0NBQW9DLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDO3dCQUNsRyxNQUFNLG9DQUFvQyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQzt3QkFDbEcsSUFBSSxvQ0FBb0MsS0FBSyxvQ0FBb0MsRUFBRTs0QkFFbEYsT0FBTyxvQ0FBb0MsR0FBRyxvQ0FBb0MsQ0FBQzt5QkFDbkY7d0JBRUQsSUFBSSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLEVBQUU7NEJBR2pGLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxTQUFTLENBQUMsc0JBQXNCLENBQUM7NEJBQ25GLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FFakIsT0FBTyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7NkJBQzNDOzRCQUVELE9BQU8sTUFBTSxDQUFDO3lCQUNkO3dCQUVELE1BQU0seUJBQXlCLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUM7d0JBQy9HLE1BQU0seUJBQXlCLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUM7d0JBQy9HLElBQUkseUJBQXlCLEtBQUsseUJBQXlCLEVBQUU7NEJBRTVELE9BQU8seUJBQXlCLEdBQUcseUJBQXlCLENBQUM7eUJBQzdEO3dCQUVELE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDO3dCQUN4RCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDeEQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFOzRCQUlqRCxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQzs0QkFDbkQsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO2dDQUdqQixPQUFPLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQzs2QkFDM0M7NEJBRUQsT0FBTyxNQUFNLENBQUM7eUJBQ2Q7d0JBZUQsT0FBTyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7cUJBSTNDO29CQUVELE9BQU8sQ0FBQyxDQUFDO2dCQUNWLENBQUMsQ0FBQyxDQUFDO2dCQUVILEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN2QjtZQUNGLENBQUMsQ0FBQztZQUVGLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQXNFMUIsSUFBSSx5QkFBeUIsR0FBcUIsRUFBRSxDQUFDO1lBRXJELElBQUkscUJBQXFCLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLHNCQUFZLEVBQUUsQ0FBQztnQkFDaEQsb0JBQW9CLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7cUJBQzVELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQ3pKLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDZCxJQUFJLEVBQUUsQ0FBQztnQkFFVCx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7b0JBQzlCLEVBQUUsRUFBRSxFQUFFLEVBQUU7b0JBQ1IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsU0FBUyxFQUFFLG9CQUFvQjtvQkFDL0IsUUFBUSxFQUFFLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7b0JBQ25ELFVBQVUsRUFBRSxDQUFDO29CQUNiLElBQUksRUFBRSxFQUFFO29CQUNSLFFBQVEsRUFBRSxFQUFFO2lCQUNaLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxvQ0FBb0MsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLG9CQUFvQixHQUFHLElBQUksc0JBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNsRSxvQkFBb0IsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQztxQkFDM0UsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDekosR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNkLElBQUksRUFBRSxDQUFDO2dCQUVULHlCQUF5QixDQUFDLElBQUksQ0FBQztvQkFDOUIsRUFBRSxFQUFFLEVBQUUsRUFBRTtvQkFDUixLQUFLLEVBQUUsQ0FBQztvQkFDUixTQUFTLEVBQUUsb0JBQW9CO29CQUMvQixRQUFRLEVBQUUsb0JBQW9CLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztvQkFDbkQsVUFBVSxFQUFFLENBQUM7b0JBQ2IsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsUUFBUSxFQUFFLEVBQUU7aUJBQ1osQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pDLFFBQVEsQ0FBQyxRQUFRLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4RTtZQUdELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFFckMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBRTtnQkFDbkQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUN6QyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7cUJBQzFDO2lCQUVEO3FCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUM3QixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDeEI7eUJBQU07d0JBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7cUJBQ25CO2lCQUNEO2dCQUVELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzFCO1lBQ0YsQ0FBQyxDQUFDO1lBRUYsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0IsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVPLG1CQUFtQixDQUFDLFFBQXNCLEVBQUUsRUFBRSxjQUFnQyxFQUFFLG9CQUFvQyxFQUFFLGlCQUEwQixJQUFJO1lBTTNKLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFDckYsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUN6QjtZQUVELE1BQU0sT0FBTyxHQUFpQixjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVyRixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFZixPQUFPLElBQUksRUFBRTtnQkFDWixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUN2QixNQUFNO2lCQUNOO2dCQUVELElBQUksaUJBQWlCLENBQUMsS0FBSyxHQUFHLG9CQUFvQixDQUFDLEtBQUssRUFBRTtvQkFHekQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxNQUFNO2lCQUNOO2dCQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTFDLE1BQU0sRUFBRSxDQUFDO2FBQ1Q7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBR08sd0JBQXdCLENBQUMsSUFBb0I7WUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFBO1lBQy9DLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUMzQixPQUFPLFFBQVEsQ0FBQztpQkFDaEI7YUFDRDtZQUdELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO29CQUNwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3ZELElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTt3QkFDM0IsT0FBTyxRQUFRLENBQUM7cUJBQ2hCO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBRUQ7SUEzNEJELHVCQTI0QkMifQ==
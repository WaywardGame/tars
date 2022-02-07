define(["require", "exports", "utilities/math/Vector2", "../objective/IObjective", "../../objectives/core/ReserveItems", "../../objectives/core/Restart", "../../utilities/Logger", "./IPlan"], function (require, exports, Vector2_1, IObjective_1, ReserveItems_1, Restart_1, Logger_1, IPlan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plan {
        constructor(planner, context, objectiveInfo, objectives) {
            this.planner = planner;
            this.context = context;
            this.objectiveInfo = objectiveInfo;
            this.log = Logger_1.loggerUtilities.createLog("Plan", objectiveInfo.objective.getHashCode());
            this.tree = this.createOptimizedExecutionTreeV2(context, objectiveInfo.objective, objectives);
            this.objectives = this.flattenTree(this.tree);
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
                            objective.cachedHashCode = objective.getHashCode();
                        }
                        return objective.cachedHashCode;
                    }
                    return objective.getHashCode();
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
                        Logger_1.loggerUtilities.queueMessage(log.type, log.args);
                    }
                }
            }
            let dynamic = false;
            let ignored = false;
            while (true) {
                const objectiveInfo = objectiveStack.shift();
                if (objectiveInfo === undefined) {
                    Logger_1.loggerUtilities.discardQueuedMessages();
                    break;
                }
                chain.push(objectiveInfo.objective);
                const preExecuteObjectiveResult = preExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo));
                if (preExecuteObjectiveResult !== undefined) {
                    Logger_1.loggerUtilities.discardQueuedMessages();
                    return preExecuteObjectiveResult;
                }
                let message = `Executing ${objectiveInfo.objective.getHashCode()} [${objectiveInfo.objective.getStatusMessage(this.context)}]`;
                const contextHashCode = this.context.getHashCode();
                if (contextHashCode.length > 0) {
                    message += `. Context hash code: ${contextHashCode}`;
                }
                Logger_1.loggerUtilities.queueMessage(objectiveInfo.objective.log, [message]);
                for (const log of objectiveInfo.logs) {
                    Logger_1.loggerUtilities.queueMessage(log.type, log.args);
                }
                const result = await objectiveInfo.objective.execute(this.context);
                if (result === IObjective_1.ObjectiveResult.Ignore) {
                    Logger_1.loggerUtilities.discardQueuedMessages();
                }
                else {
                    Logger_1.loggerUtilities.processQueuedMessages();
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
                                this.log.warn(`Invalid return value for ${objectiveInfo.objective.getHashCode()}. status: ${objectivePipeline.status}`);
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
        createOptimizedExecutionTreeV2(context, objective, objectives) {
            let id = 0;
            const rootTree = {
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
            depthMap.set(1, rootTree);
            const gatherObjectiveTrees = [];
            const reserveItemObjectives = new Map();
            const keepInInventoryReserveItemObjectives = new Map();
            for (const { depth, objective, difficulty, logs } of objectives) {
                const hashCode = objective.getHashCode();
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
                const hashCode = objective.getHashCode();
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
            if (gatherObjectiveTrees.length > 0) {
                const unvisited = [];
                const visited = [];
                for (const gatherObjectiveTree of gatherObjectiveTrees) {
                    let position;
                    for (const child of gatherObjectiveTree.children) {
                        position = child.objective.getPosition?.();
                        if (position !== undefined) {
                            break;
                        }
                    }
                    if (position === undefined) {
                        throw new Error(`Unknown gather objective position ${gatherObjectiveTree.objective.getHashCode()} ${this.getTreeString(gatherObjectiveTree)}`);
                    }
                    const vertex = { tree: gatherObjectiveTree, position };
                    unvisited.push(vertex);
                }
                visited.push({ tree: rootTree, position: context.getPosition() });
                while (unvisited.length > 0) {
                    const vertex = visited[visited.length - 1];
                    let closestVertex;
                    for (let i = 0; i < unvisited.length; i++) {
                        const unvisitedVertex = unvisited[i];
                        const distance = Vector2_1.default.squaredDistance(vertex.position, unvisitedVertex.position);
                        if (closestVertex === undefined || closestVertex.distance > distance) {
                            closestVertex = {
                                vertex: unvisitedVertex,
                                index: i,
                                distance,
                            };
                        }
                    }
                    if (closestVertex === undefined) {
                        throw new Error("Impossible vertex");
                    }
                    unvisited.splice(closestVertex.index, 1);
                    visited.push(closestVertex.vertex);
                }
                for (const { tree: visitedTree } of visited) {
                    if (!visitedTree.parent) {
                        continue;
                    }
                    visitedTree.parent.groupedAway = true;
                    const index = visitedTree.parent.children.indexOf(visitedTree);
                    if (index === -1) {
                        throw new Error(`Invalid gather objective tree for ${visitedTree.objective.getHashCode()}`);
                    }
                    visitedTree.parent.children.splice(index, 1);
                    visitedTree.parent = rootTree;
                }
                rootTree.children = visited.slice(1).map(({ tree: visitedTree }) => visitedTree).concat(rootTree.children);
            }
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
                    hashCode: reserveItemObjective.getHashCode(),
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
                    hashCode: reserveItemObjective.getHashCode(),
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
    }
    exports.default = Plan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLElBQUk7UUFvQ3hCLFlBQTZCLE9BQWlCLEVBQW1CLE9BQWdCLEVBQW1CLGFBQTZCLEVBQUUsVUFBNEI7WUFBbEksWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNoSSxJQUFJLENBQUMsR0FBRyxHQUFHLHdCQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFJcEYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUs5QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsYUFBYSxDQUFDLFNBQVMsY0FBYyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7UUFuQ00sTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsVUFBd0QsRUFBRSxpQkFBMEIsSUFBSTtZQUd6SSxPQUFPLFVBQVUsQ0FBQyxDQUFDO2dCQUNsQixVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7d0JBQzdCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9B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
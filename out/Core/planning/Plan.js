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
        static getPipelineString(context, objectives) {
            return objectives ?
                objectives.map(objective => Array.isArray(objective) ? Plan.getPipelineString(context, objective) : objective.getHashCode()).join(" -> ") :
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
            }
            const walkAndSortTree = (tree) => {
                tree.children = tree.children.sort((treeA, treeB) => {
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
                    .sort(([a], [b]) => a.localeCompare(b, navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
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
                    if (!map.has(hashCode)) {
                        map.set(hashCode, objective.items);
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
                    .sort(([a], [b]) => a.localeCompare(b, navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
                    .map(a => a[1])
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
                    .sort(([a], [b]) => a.localeCompare(b, navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
                    .map(a => a[1])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLElBQUk7UUFzQnhCLFlBQTZCLE9BQWlCLEVBQW1CLE9BQWdCLEVBQW1CLGFBQTZCLEVBQUUsVUFBNEI7WUFBbEksWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNoSSxJQUFJLENBQUMsR0FBRyxHQUFHLHdCQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFJcEYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUs5QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsYUFBYSxDQUFDLFNBQVMsY0FBYyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7UUFyQk0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsVUFBd0Q7WUFFekcsT0FBTyxVQUFVLENBQUMsQ0FBQztnQkFDbEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUMxQixLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENB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
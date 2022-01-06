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
                objectives.map(objective => Array.isArray(objective) ? Plan.getPipelineString(context, objective) : `${objective.getHashCode()} (${objective.getStatusMessage(context)})`).join(" -> ") :
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
        createOptimizedExecutionTreeV2(context, objective, objectives) {
            var _a, _b;
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
                if (objective.gatherObjectivePriority !== undefined) {
                    gatherObjectiveTrees.push(childTree);
                }
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
            walkAndSortTree(rootTree);
            if (gatherObjectiveTrees.length > 0) {
                const unvisited = [];
                const visited = [];
                for (const gatherObjectiveTree of gatherObjectiveTrees) {
                    let position;
                    for (const child of gatherObjectiveTree.children) {
                        position = (_b = (_a = child.objective).getPosition) === null || _b === void 0 ? void 0 : _b.call(_a);
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
                    parent: rootTree,
                };
                rootTree.children = [reserveItemObjectiveTree].concat(rootTree.children);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3BsYW5uaW5nL1BsYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLElBQUk7UUFxQnhCLFlBQTZCLE9BQWlCLEVBQW1CLE9BQWdCLEVBQW1CLGFBQTZCLEVBQUUsVUFBNEI7WUFBbEksWUFBTyxHQUFQLE9BQU8sQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNoSSxJQUFJLENBQUMsR0FBRyxHQUFHLHdCQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFJcEYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFOUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUs5QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsYUFBYSxDQUFDLFNBQVMsY0FBYyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7UUFwQk0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsVUFBd0Q7WUFDekcsT0FBTyxVQUFVLENBQUMsQ0FBQztnQkFDbEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUMxQixLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENB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
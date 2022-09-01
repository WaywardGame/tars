import type Item from "game/item/Item";
import type { ILogLine } from "utilities/Log";
import type Log from "utilities/Log";
// @ts-ignore
import Vector2 from "utilities/math/Vector2";

import type Context from "../context/Context";
import type { IObjective, IObjectiveInfo, IObjectivePriority } from "../objective/IObjective";
import { CalculatedDifficultyStatus, ObjectiveResult } from "../objective/IObjective";
import ReserveItems from "../../objectives/core/ReserveItems";
import Restart from "../../objectives/core/Restart";

import type { ExecuteResult, IExecutionTree, IPlan } from "./IPlan";
import { ExecuteResultType } from "./IPlan";
import type { IPlanner } from "./IPlanner";

// @ts-ignore
interface ITreeVertex {
	tree: IExecutionTree;
	position: IVector3;
}

/**
 * Represents a chain of objectives that can be executed in order to complete the plan.
 */
export default class Plan implements IPlan {

	public readonly log: Log;

	/**
	 * Full execution tree
	 */
	public readonly tree: IExecutionTree;

	/**
	 * Flattened list of objectives to execute
	 */
	public readonly objectives: IObjectiveInfo[];

	public static getPipelineString(context: Context, objectives: Array<IObjective | IObjective[]> | undefined, cacheHashcodes: boolean = true): string {
		// not including objective.getStatusMessage(context) because translations are expensive/slow
		// allowing hash code caching because an interrupt hash code will always always change after execution since the hash code might include item id, which become undefined when the item is no longer valid
		return objectives ?
			objectives.map(objective => {
				if (Array.isArray(objective)) {
					return Plan.getPipelineString(context, objective, cacheHashcodes);
				}

				if (cacheHashcodes) {
					if (!(objective as any).cachedHashCode) {
						(objective as any).cachedHashCode = objective.getHashCode(context);
					}

					return (objective as any).cachedHashCode;
				}

				return objective.getHashCode(context);
			}).join(" -> ") :
			"Empty pipeline";
	}

	constructor(private readonly planner: IPlanner, private readonly context: Context, private readonly objectiveInfo: IObjectiveInfo, objectives: IObjectiveInfo[]) {
		this.log = context.utilities.logger.createLog("Plan", objectiveInfo.objective.getHashCode(context));

		// this.tree = this.createExecutionTree(objective, objectives);
		// this.tree = this.createOptimizedExecutionTree(objectiveInfo.objective, objectives);
		this.tree = this.createOptimizedExecutionTreeV2(context, objectiveInfo.objective, objectives);

		this.objectives = this.processTree(this.tree);

		// this.getTreeString(this.createExecutionTree(objective, objectives)), 

		// electron 6 bug - don't print complex objects - https://github.com/electron/electron/issues/20334
		this.log.debug(`Execution tree for ${objectiveInfo.objective} (context: ${context.getHashCode()}).`, this.getTreeString(this.tree));
	}

	/**
	 * Print the excution tree as a string
	 */
	public getTreeString(root: IExecutionTree = this.tree): string {
		let str = "";

		const writeTree = (tree: IExecutionTree, depth = 0) => {
			str += `${"  ".repeat(depth)}${tree.hashCode} (${tree.id})`;

			str += ` (Difficulty is ${tree.difficulty})`;

			if (tree.priority !== undefined) {
				str += " (";
				str += `${tree.priority.readyToCraftObjectives} ready to craft objectives`;
				str += `, ${tree.priority.totalCraftObjectives} total craft objectives`;

				str += `, ${tree.priority.totalGatherObjectives} gather objectives`;
				if (tree.priority.totalGatherObjectives > 0) {
					str += `, ${Object.keys(tree.priority.gatherObjectives).filter(key => (tree.priority!.gatherObjectives as any)[key] > 0).map(key => `${key}=${(tree.priority!.gatherObjectives as any)[key]}`).join(", ")}`;
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

	/**
	 * Executes the plan. It will continue executing objectives until it's done or isReady returns false
	 * @param preExecuteObjective Called before executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 * @param postExecuteObjective Called after executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 */
	public async execute(
		preExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined,
		postExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined): Promise<ExecuteResult> {
		const chain: IObjective[] = [];
		const objectiveStack: IObjectiveInfo[] = [...this.objectives];

		if (objectiveStack.length > 1) {
			this.log.info("Executing plan", Plan.getPipelineString(this.context, objectiveStack.map(objectiveInfo => objectiveInfo.objective)));

			if (this.objectiveInfo.objective !== objectiveStack[0].objective) {
				// print logs for the planned objective if it's not in the stack
				for (const log of this.objectiveInfo.logs) {
					this.context.utilities.logger.queueMessage(log.type, log.args);
				}
			}
		}

		// todo: print original objective logs?

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

			// queue this messsage to be logged if another message occurs
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

			if (result === ObjectiveResult.Ignore) {
				this.context.utilities.logger.discardQueuedMessages();

			} else {
				this.context.utilities.logger.processQueuedMessages();
			}

			if (result === ObjectiveResult.Pending) {
				const objectiveResults = this.getObjectiveResults(chain, objectiveStack, objectiveInfo);
				// console.log("chain", Plan.getPipelineString(chain));
				// // console.log("chain", Plan.getPipelineString(objectiveStack.map(objectiveInfo => objective));
				// if (this.context.options.developerMode) {
				// 	if (pendingop.length > 0 && !(pendingop[pendingop.length - 1] instanceof Restart)) {
				// 		console.log("pendingfix missing restart", Plan.getPipelineString(pendingop));
				// 		console.log("pendingfix stacks", `(${objectiveInfo.depth}|${objectiveInfo.objective.getHashCode()})`, `${objectiveStack.map(o => `(${objectiveInfo.depth}|${objectiveInfo.objective.getHashCode()})`).join(",")}`);
				// 	}
				// }

				return {
					type: ExecuteResultType.Pending,
					objectives: objectiveResults,
				};
			}

			if (result === ObjectiveResult.Restart) {
				return {
					type: ExecuteResultType.Restart,
				};
			}

			if (result === ObjectiveResult.Ignore) {
				ignored = true;
			}

			// don't include the current objective here because we completed it
			const postExecuteObjectiveResult = postExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo, false));
			if (postExecuteObjectiveResult !== undefined) {
				return postExecuteObjectiveResult;
			}

			// once an objective runs as dynamic, we need to continue running them in dynamic mode
			dynamic = dynamic || objectiveInfo.objective.isDynamic();

			if (dynamic) {
				let resultObjectives: IObjective[] = [];

				if (Array.isArray(result)) {
					if (Array.isArray(result[0])) {
						const objectivePipeline = await this.planner.pickEasiestObjectivePipeline(this.context, result as IObjective[][]);
						if (objectivePipeline.status === CalculatedDifficultyStatus.Possible) {
							resultObjectives = objectivePipeline.objectives;

						} else {
							this.log.warn(`Invalid return value for ${objectiveInfo.objective.getHashCode(this.context)}. status: ${objectivePipeline.status}`);
							break;
						}

					} else {
						resultObjectives = (result as IObjective[]);
					}

				} else if (typeof (result) !== "number") {
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
			}/* else {
				if (Array.isArray(result)) {
					if (!Array.isArray(result[0])) {
						if (objectiveStack.length > 0 && (result as IObjective[]).length > 0 &&
							objectiveStack[0].getHashCode() !== (result as IObjective[])[0].getHashCode()) {
							this.log.warn(`Objective mismatch while running ${objectiveInfo.getHashCode()}. Expected ${objectiveStack[0].getHashCode()}. Actual ${(result as IObjective[])[0].getHashCode()}`);
						}
					}

				} else if (typeof (result) !== "number") {
					if (objectiveStack.length > 0 && objectiveStack[0].getHashCode() !== result.getHashCode()) {
						this.log.warn(`Objective mismatch while running ${objectiveInfo.getHashCode()}. Expected ${objectiveStack[0].getHashCode()}. Actual ${result.getHashCode()}`);
					}
				}
			}*/
		}

		// if (objectiveStack.length > 0) {
		// 	console.warn("maybe a bug - Ignoreobjective stack", objectiveStack);
		// }

		// return Ignored if at least one was ignored
		return {
			type: ignored ? ExecuteResultType.Ignored : ExecuteResultType.Completed,
		};
	}

	private processTree(root: IExecutionTree): IObjectiveInfo[] {
		const objectives: IObjectiveInfo[] = [];

		const walkTree = (tree: IExecutionTree, depth: number, logs: ILogLine[]) => {
			if (tree.children.length === 0 || tree.objective.isDynamic()) {
				objectives.push({
					depth: depth,
					objective: tree.objective,
					difficulty: tree.difficulty,
					logs: [...logs, ...tree.logs],
				});

			} else {
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

	// @ts-ignore
	// private createExecutionTree(objective: IObjective, objectives: IObjectiveInfo[]): IExecutionTree {
	// 	let id = 0;

	// 	const tree: IExecutionTree = {
	// 		id: id++,
	// 		depth: 1,
	// 		objective: objective,
	// 		hashCode: objective.getHashCode(this.context),
	// 		difficulty: 0,
	// 		logs: [],
	// 		children: [],
	// 	};

	// 	const depthMap = new Map<number, IExecutionTree>();
	// 	depthMap.set(1, tree);

	// 	for (const { depth, objective, difficulty, logs } of objectives) {
	// 		const parent = depthMap.get(depth - 1);
	// 		if (!parent) {
	// 			this.log.error(`Root objective: ${objective}`);
	// 			this.log.error("Objectives", objectives);

	// 			throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${objective.getHashCode(this.context)}`);
	// 		}

	// 		const childTree: IExecutionTree = {
	// 			id: id++,
	// 			depth: depth,
	// 			objective: objective,
	// 			hashCode: objective.getHashCode(this.context),
	// 			difficulty: difficulty,
	// 			logs: logs,
	// 			children: [],
	// 			parent: parent,
	// 		};

	// 		parent.children.push(childTree);

	// 		depthMap.set(depth, childTree);
	// 	}

	// 	return tree;
	// }

	// @ts-ignore
	// private createOptimizedExecutionTree(objective: IObjective, objectives: IObjectiveInfo[]): IExecutionTree {
	// 	let id = 0;

	// 	const tree: IExecutionTree = {
	// 		id: id++,
	// 		depth: 0,
	// 		objective: objective,
	// 		hashCode: objective.getHashCode(),
	// 		difficulty: 0,
	// 		logs: [],
	// 		children: [],
	// 	};

	// 	const objectiveGroups = new Map<string, IExecutionTree>();

	// 	const depthMap = new Map<number, IExecutionTree>();
	// 	depthMap.set(1, tree);

	// 	const reserveItemObjectives: Map<string, Item[]> = new Map();

	// 	for (const { depth, objective, difficulty, logs } of objectives) {
	// 		const hashCode = objective.getHashCode();

	// 		if (objective instanceof ReserveItems) {
	// 			if (!reserveItemObjectives.has(hashCode)) {
	// 				reserveItemObjectives.set(hashCode, objective.items);
	// 			}

	// 			// leave the reserve items objectives where they are just so we can see what's causing them to be reserved when viewing the tree
	// 			continue;
	// 		}

	// 		let parent = depthMap.get(depth - 1);
	// 		if (!parent) {
	// 			this.log.error(`Root objective: ${objective}`);
	// 			this.log.error("Objectives", objectives);

	// 			throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${hashCode}`);
	// 		}

	// 		if (objective.canGroupTogether()) {
	// 			// group objectives with the same hash codes together under the same parent
	// 			const objectiveGroupId = `${depth},${hashCode}`;
	// 			const objectiveGroupParent = objectiveGroups.get(objectiveGroupId);
	// 			if (objectiveGroupParent) {
	// 				// we are changing the parent for this objective
	// 				// flag the original parent as being changed
	// 				parent.groupedAway = true;
	// 				parent = objectiveGroupParent;

	// 			} else {
	// 				objectiveGroups.set(objectiveGroupId, parent);
	// 			}
	// 		}

	// 		const childTree: IExecutionTree = {
	// 			id: id++,
	// 			depth,
	// 			objective,
	// 			hashCode,
	// 			difficulty,
	// 			logs,
	// 			parent,
	// 			children: [],
	// 		};

	// 		parent.children.push(childTree);

	// 		depthMap.set(depth, childTree);
	// 	}

	// 	/*
	// 	let acquireItemGroup: IExecutionTree | undefined;
	// 	let acquireItemGroupIndex: number | undefined;
	// 	let checked: Set<number> = new Set();

	// 	// console.log(this.getTreeString(tree));

	// 	const walkAndReorganizeTree = (index: number, tree: IExecutionTree) => {
	// 		if ((tree.objective as any).calculatePriority) {
	// 			const objectivePriority: any = {
	// 				priority: 0,
	// 				numberOfObjectives: 0,
	// 				numberOfAcquire: 0,
	// 				numberOfGather: 0,
	// 				nubmerofGatherWithoutChest: 0,
	// 			};

	// 			(tree.objective as any).calculatePriority(objectivePriority, tree, true);
	// 			// console.log("check", tree, objectivePriority.numberOfObjectives, objectivePriority.numberOfGather, objectivePriority.numberOfAcquire);
	// 			if (objectivePriority.numberOfObjectives <= objectivePriority.numberOfAcquire + objectivePriority.numberOfGather) {
	// 				if (acquireItemGroup === undefined) {
	// 					acquireItemGroup = tree.parent;
	// 					acquireItemGroupIndex = index;
	// 					// console.log("setting parent", acquireItemGroup, acquireItemGroupIndex);

	// 				} else {
	// 					// console.log("moving to new parent", tree);
	// 					// move to the acquire item group
	// 					if (tree.parent) {
	// 						// remove from current parent
	// 						tree.parent.children.splice(index, 1);
	// 					}

	// 					// add to new parent
	// 					acquireItemGroup.children.splice(acquireItemGroupIndex! + 1, 0, tree);
	// 				}
	// 			}
	// 		}

	// 		// tree.children = tree.children.sort((treeA, treeB) => {
	// 		// 	if (//treeA.objective.constructor === treeB.objective.constructor &&
	// 		// 		// treeA.objective.getName() === treeB.objective.getName() &&
	// 		// 		treeA.objective.sort && treeB.objective.sort) {
	// 		// 		return treeA.objective.sort(this.context, treeA, treeB);
	// 		// 	}

	// 		// 	return 0;
	// 		// });

	// 		for (let i = 0; i < tree.children.length; i++) {
	// 			const child = tree.children[i];
	// 			if (!checked.has(child.id)) {
	// 				checked.add(child.id);
	// 				walkAndReorganizeTree(i, child);
	// 			}
	// 		}
	// 	};

	// 	// walkAndReorganizeTree(-1, tree);
	// 	*/

	// 	const walkAndSortTree = (tree: IExecutionTree) => {
	// 		tree.children = tree.children.sort((treeA, treeB) => {
	// 			// if (//treeA.objective.constructor === treeB.objective.constructor &&
	// 			// 	// treeA.objective.getName() === treeB.objective.getName() &&
	// 			// 	treeA.objective.sort && treeB.objective.sort) {
	// 			// 	return treeA.objective.sort(this.context, treeA, treeB);
	// 			// }

	// 			return 0;
	// 		});

	// 		for (const child of tree.children) {
	// 			walkAndSortTree(child);
	// 		}
	// 	};

	// 	walkAndSortTree(tree);

	// 	// move all reserve item objectives to the top of the tree so they are executed first
	// 	// this will prevent interrupt objectives from messing with these items
	// 	if (reserveItemObjectives.size > 0) {
	// 		const reserveItemObjective = new ReserveItems();
	// 		reserveItemObjective.items = Array.from(reserveItemObjectives)
	// 			.sort(([a], [b]) => a.localeCompare(b, navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
	// 			.map(a => a[1])
	// 			.flat();

	// 		const reserveItemObjectiveTree: IExecutionTree = {
	// 			id: id++,
	// 			depth: 1,
	// 			objective: reserveItemObjective,
	// 			hashCode: reserveItemObjective.getHashCode(),
	// 			difficulty: 0,
	// 			logs: [],
	// 			children: [],
	// 		};

	// 		const children = [reserveItemObjectiveTree].concat(tree.children);

	// 		tree.children = children;
	// 	}

	// 	return tree;
	// }

	private createOptimizedExecutionTreeV2(context: Context, objective: IObjective, objectives: IObjectiveInfo[]): IExecutionTree {
		let id = 0;

		const rootTree: IExecutionTree = {
			id: id++,
			depth: 0,
			objective: objective,
			hashCode: objective.getHashCode(context),
			difficulty: 0,
			logs: [],
			children: [],
		};

		const objectiveGroups = new Map<string, IExecutionTree>();

		const depthMap = new Map<number, IExecutionTree>();
		depthMap.set(1, rootTree);

		const gatherObjectiveTrees: IExecutionTree[] = [];
		const reserveItemObjectives: Map<Item, number> = new Map();
		const keepInInventoryReserveItemObjectives: Map<Item, number> = new Map();

		// todo: find the easiest objective for each group. and make that objective the first one?

		for (const { depth, objective, difficulty, logs } of objectives) {
			const hashCode = objective.getHashCode(context);

			if (objective instanceof ReserveItems) {
				const map = objective.shouldKeepInInventory() ? keepInInventoryReserveItemObjectives : reserveItemObjectives;

				for (const item of objective.items) {
					map.set(item, (map.get(item) ?? 0) + 1);
				}

				// leave the reserve items objectives where they are just so we can see what's causing them to be reserved when viewing the tree
				// continue;
			}

			let parent = depthMap.get(depth - 1);
			if (!parent) {
				this.log.error(`Root objective: ${objective}`);
				this.log.error("Objectives", objectives);

				throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${hashCode}`);
			}

			if (objective.canGroupTogether()) {
				// group objectives with the same hash codes together under the same parent
				const objectiveGroupId = `${depth},${hashCode}`;
				const objectiveGroupParent = objectiveGroups.get(objectiveGroupId);
				if (objectiveGroupParent) {
					// we are changing the parent for this objective
					// flag the original parent as being changed
					parent.groupedAway = objectiveGroupParent;
					parent = objectiveGroupParent;

				} else {
					parent.groupParent = true;
					objectiveGroups.set(objectiveGroupId, parent);
				}
			}

			const childTree: IExecutionTree = {
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

		const cachedExecutionPriorities: Map<string, Map<IExecutionTree, IObjectivePriority>> = new Map();

		const getExecutionPriority = (objective: IObjective, tree: IExecutionTree) => {
			const hashCode = objective.getHashCode(context);

			let objectivePriorities = cachedExecutionPriorities.get(hashCode);
			if (!objectivePriorities) {
				objectivePriorities = new Map();
				cachedExecutionPriorities.set(hashCode, objectivePriorities);
			}

			let priority = objectivePriorities.get(tree);
			if (priority === undefined) {
				priority = objective.getExecutionPriority!(this.context, tree);
				objectivePriorities.set(tree, priority);
			}

			return priority;
		}

		const walkAndSortTree = (tree: IExecutionTree) => {
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
						// prioritize the objective that requires gather from corpses (corpses can expire!)
						return gatherFromCorpsesObjectivesB - gatherFromCorpsesObjectivesA;
					}

					const gatherFromCreatureObjectivesA = priorityA.gatherObjectives.GatherFromCreature;
					const gatherFromCreatureObjectivesB = priorityB.gatherObjectives.GatherFromCreature;;
					if (gatherFromCreatureObjectivesA !== gatherFromCreatureObjectivesB) {
						// prioritize the objective that requires gather from creatures
						return gatherFromCreatureObjectivesB - gatherFromCreatureObjectivesA;
					}

					const gatherFromTerrainResourceObjectivesA = priorityA.gatherObjectives.GatherFromTerrainResource;
					const gatherFromTerrainResourceObjectivesB = priorityB.gatherObjectives.GatherFromTerrainResource;
					if (gatherFromTerrainResourceObjectivesA !== gatherFromTerrainResourceObjectivesB) {
						// prioritize the objective that requires gather from terrain resources
						return gatherFromTerrainResourceObjectivesB - gatherFromTerrainResourceObjectivesA;
					}

					if (priorityA.readyToCraftObjectives > 0 || priorityB.readyToCraftObjectives > 0) {
						// one or both objectives can be crafted without having to gather anything (all items are in the inventory)
						// prioritize the objective that can be crafted now
						const result = priorityB.readyToCraftObjectives - priorityA.readyToCraftObjectives;
						if (result === 0) {
							// tie break based on difficulty. run the easier objective
							return treeA.difficulty - treeB.difficulty;
						}

						return result;
					}

					const nonChestGatherObjectivesA = priorityA.totalGatherObjectives - priorityA.gatherObjectives.GatherFromChest;
					const nonChestGatherObjectivesB = priorityB.totalGatherObjectives - priorityB.gatherObjectives.GatherFromChest;
					if (nonChestGatherObjectivesA !== nonChestGatherObjectivesB) {
						// prioritize the objective that requires more gathering
						return nonChestGatherObjectivesB - nonChestGatherObjectivesA;
					}

					const craftObjectivesA = priorityA.totalCraftObjectives;
					const craftObjectivesB = priorityB.totalCraftObjectives;
					if (craftObjectivesA > 0 || craftObjectivesB > 0) {
						// one or both objectives requires crafting
						// prioritize the objective that has crafting
						// otherwise we will end up grabing completed components from chests instead of crafting the other components for the recipe
						const result = craftObjectivesB - craftObjectivesA;
						if (result === 0) {
							// both require the same amount of crafting
							// tie break based on difficulty. run the easier objective
							return treeA.difficulty - treeB.difficulty;
						}

						return result;
					}

					// if (craftObjectivesA !== craftObjectivesB) {
					// 	// prioritize the objective that requires less crafting
					// 	const result = craftObjectivesA - craftObjectivesB;
					// 	if (result === 0) {
					// 		// tie break based on difficulty. run the easier objective
					// 		return treeA.difficulty - treeB.difficulty;
					// 	}

					// 	return result;

					// }

					// prioritize the easier recipe. easier recipes likely use existing items in the inventory
					return treeA.difficulty - treeB.difficulty;

					// prioritize the harder recipe - the one that requires more gathering
					// return priorityB.totalGatherObjectives - priorityA.totalGatherObjectives;
				}

				return 0;
			});

			for (const child of tree.children) {
				walkAndSortTree(child);
			}
		};

		walkAndSortTree(rootTree);

		/* it needs to take into account objective dependencies. it shouldn't try to craft before obtaining materials
		// move gather objectives to the front with sorting
		if (gatherObjectiveTrees.length > 0) {
			// traveling salesman problem with the first vertex being the players location
			const unvisited: ITreeVertex[] = [];
			const visited: ITreeVertex[] = [];

			for (const gatherObjectiveTree of gatherObjectiveTrees) {
				const position = this.getExecutionTreePosition(gatherObjectiveTree);
				if (position === undefined) {
					throw new Error(`Unknown gather objective position ${gatherObjectiveTree.objective.getHashCode(context)} ${this.getTreeString(gatherObjectiveTree)}`);
				}

				const vertex = { tree: gatherObjectiveTree, position };
				unvisited.push(vertex);
			}

			visited.push({ tree: rootTree, position: context.getPosition() });

			while (unvisited.length > 0) {
				const vertex = visited[visited.length - 1];

				let closestVertex: { vertex: ITreeVertex; index: number; distance: number } | undefined;

				for (let i = 0; i < unvisited.length; i++) {
					const unvisitedVertex = unvisited[i];
					const distance = Vector2.squaredDistance(vertex.position, unvisitedVertex.position);

					if (closestVertex === undefined || closestVertex.distance > distance) {
						closestVertex = {
							vertex: unvisitedVertex,
							index: i,
							distance,
						}
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
					throw new Error(`Invalid gather objective tree for ${visitedTree.objective.getHashCode(context)}`);
				}

				visitedTree.parent.children.splice(index, 1);
				visitedTree.parent = rootTree;
			}

			rootTree.children = visited.slice(1).map(({ tree: visitedTree }) => visitedTree).concat(rootTree.children);
		}
		*/

		// move all reserve item objectives to the top of the tree so they are executed first
		// this will prevent interrupt objectives from messing with these items
		// todo: split up soft / hard reserve too?
		let objectivesToInsertAtFront: IExecutionTree[] = [];

		if (reserveItemObjectives.size > 0) {
			const reserveItemObjective = new ReserveItems();
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
			const reserveItemObjective = new ReserveItems().keepInInventory();
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

		// move grouped children to the first spot they appear in the tree
		const groupsSeen = new Set<number>();

		const walkAndRegroupTree = (tree: IExecutionTree) => {
			if (tree.groupedAway) {
				if (!groupsSeen.has(tree.groupedAway.id)) {
					groupsSeen.add(tree.groupedAway.id);
					tree.children = tree.groupedAway.children;
				}

			} else if (tree.groupParent) {
				if (!groupsSeen.has(tree.id)) {
					groupsSeen.add(tree.id);
				} else {
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

	private getObjectiveResults(chain: IObjective[] = [], objectiveStack: IObjectiveInfo[], currentObjectiveInfo: IObjectiveInfo, includeCurrent: boolean = true) {
		// probably not needed?
		// if (!this.objectiveInfo.objective.canSaveChildObjectives()) {
		// 	return [this.objectiveInfo.objective];
		// }

		const objectiveResult = chain.find(objective => !objective.canSaveChildObjectives());
		if (objectiveResult) {
			return [objectiveResult];
		}

		const results: IObjective[] = includeCurrent ? [currentObjectiveInfo.objective] : [];

		let offset = 0;

		while (true) {
			const nextObjectiveInfo = objectiveStack[offset];
			if (!nextObjectiveInfo) {
				break;
			}

			if (nextObjectiveInfo.depth < currentObjectiveInfo.depth) {
				// depth is changing, force a restart
				// todo: verify that we want this
				results.push(new Restart().setStatus("Calculating objective..."));
				break;
			}

			results.push(nextObjectiveInfo.objective);

			offset++;
		}

		return results;
	}

	// @ts-ignore
	private getExecutionTreePosition(tree: IExecutionTree): IVector3 | undefined {
		const position = tree.objective.getPosition?.()
		if (position !== undefined) {
			return position;
		}

		for (const child of tree.children) {
			const position = child.objective.getPosition?.();
			if (position !== undefined) {
				return position;
			}
		}

		// check it's children
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

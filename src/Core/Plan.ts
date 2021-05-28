import Item from "game/item/Item";
import Log, { ILogLine } from "utilities/Log";

import Context from "../Context";
import { CalculatedDifficultyStatus, IObjective, IObjectiveInfo, ObjectiveResult } from "../IObjective";
import ReserveItems from "../objectives/core/ReserveItems";
import Restart from "../objectives/core/Restart";
import { createLog, discardQueuedMessages, processQueuedMessages, queueMessage } from "../utilities/Logger";

import { ExecuteResult, ExecuteResultType, IExecutionTree, IPlan } from "./IPlan";
import { IPlanner } from "./IPlanner";

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

	constructor(private readonly planner: IPlanner, private readonly context: Context, private readonly objectiveInfo: IObjectiveInfo, objectives: IObjectiveInfo[]) {
		this.log = createLog("Plan", objectiveInfo.objective.getHashCode());

		// this.tree = this.createExecutionTree(objective, objectives);
		this.tree = this.createOptimizedExecutionTree(objectiveInfo.objective, objectives);

		this.objectives = this.flattenTree(this.tree);

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
			str += `${"  ".repeat(depth)}${tree?.hashCode}\n`;

			for (const child of tree?.children) {
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
			this.log.info("Executing plan", objectiveStack.map(objectiveInfo => objectiveInfo.objective.getIdentifier()).join(" -> "));

			if (this.objectiveInfo.objective !== objectiveStack[0].objective) {
				// print logs for the planned objective if it's not in the stack
				for (const log of this.objectiveInfo.logs) {
					queueMessage(log.type, log.args);
				}
			}
		}

		// todo: print original objective logs?

		let dynamic = false;

		while (true) {
			const objectiveInfo = objectiveStack.shift();
			if (objectiveInfo === undefined) {
				discardQueuedMessages();
				break;
			}

			chain.push(objectiveInfo.objective);

			const preExecuteObjectiveResult = preExecuteObjective(() => this.getObjectiveResults(chain, objectiveStack, objectiveInfo));
			if (preExecuteObjectiveResult !== undefined) {
				discardQueuedMessages();
				return preExecuteObjectiveResult;
			}

			// queue this messsage to be logged if another message occurs
			let message = `Executing ${objectiveInfo.objective.getHashCode()}`;

			const contextHashCode = this.context.getHashCode();
			if (contextHashCode.length > 0) {
				message += `. Context hash code: ${contextHashCode}`;
			}

			queueMessage(objectiveInfo.objective.log, [message]);

			for (const log of objectiveInfo.logs) {
				queueMessage(log.type, log.args);
			}

			const result = await objectiveInfo.objective.execute(this.context);

			if (result === ObjectiveResult.Ignore) {
				discardQueuedMessages();

			} else {
				processQueuedMessages();
			}

			if (result === ObjectiveResult.Pending) {
				return {
					type: ExecuteResultType.Pending,
					objectives: this.getObjectiveResults(chain, objectiveStack, objectiveInfo),
				};
			}

			if (result === ObjectiveResult.Restart) {
				return {
					type: ExecuteResultType.Restart,
				};
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
							this.log.error("Invalid return value", objectiveInfo.objective.getHashCode(), objectivePipeline);
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

		return {
			type: ExecuteResultType.Completed,
		};
	}

	private flattenTree(root: IExecutionTree): IObjectiveInfo[] {
		const objectives: IObjectiveInfo[] = [];

		const walkTree = (tree: IExecutionTree, depth: number, logs: ILogLine[]) => {
			if (tree.children.length === 0) {
				objectives.push({
					depth: depth,
					objective: tree.objective,
					difficulty: tree.difficulty,
					logs: [...logs, ...tree.logs],
				});

			} else {
				for (let i = 0; i < tree.children.length; i++) {
					const child = tree.children[i];
					walkTree(child, depth + 1, i === 0 ? [...logs, ...tree.logs] : []);
				}
			}
		};

		walkTree(root, 0, []);

		return objectives;
	}

	// @ts-ignore
	private createExecutionTree(objective: IObjective, objectives: IObjectiveInfo[]): IExecutionTree {
		let id = 0;

		const tree: IExecutionTree = {
			id: id++,
			depth: 1,
			objective: objective,
			hashCode: objective.getHashCode(),
			difficulty: 0,
			logs: [],
			children: [],
		};

		const depthMap = new Map<number, IExecutionTree>();
		depthMap.set(1, tree);

		for (const { depth, objective, difficulty, logs } of objectives) {
			const parent = depthMap.get(depth - 1);
			if (!parent) {
				this.log.error(`Root objective: ${objective}`);
				this.log.error("Objectives", objectives);

				throw new Error(`Invalid parent tree ${depth - 1}. Objective: ${objective.getHashCode()}`);
			}

			const childTree: IExecutionTree = {
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

	private createOptimizedExecutionTree(objective: IObjective, objectives: IObjectiveInfo[]): IExecutionTree {
		let id = 0;

		const tree: IExecutionTree = {
			id: id++,
			depth: 0,
			objective: objective,
			hashCode: objective.getHashCode(),
			difficulty: 0,
			logs: [],
			children: [],
		};

		const objectiveGroups = new Map<string, IExecutionTree>();

		const depthMap = new Map<number, IExecutionTree>();
		depthMap.set(1, tree);

		const reserveItemObjectives: Map<string, Item[]> = new Map();

		for (const { depth, objective, difficulty, logs } of objectives) {
			const hashCode = objective.getHashCode();

			if (objective instanceof ReserveItems) {
				if (!reserveItemObjectives.has(hashCode)) {
					reserveItemObjectives.set(hashCode, objective.items);
				}

				// // leave the reserve items objectives where they are just so we can see what's causing them to be reserved when viewing the tree
				continue;
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
					parent = objectiveGroupParent;

				} else {
					objectiveGroups.set(objectiveGroupId, parent);
				}
			}

			const childTree: IExecutionTree = {
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

		/*
		let acquireItemGroup: IExecutionTree | undefined;
		let acquireItemGroupIndex: number | undefined;
		let checked: Set<number> = new Set();

		// console.log(this.getTreeString(tree));

		const walkAndReorganizeTree = (index: number, tree: IExecutionTree) => {
			if ((tree.objective as any).calculatePriority) {
				const objectivePriority: any = {
					priority: 0,
					numberOfObjectives: 0,
					numberOfAcquire: 0,
					numberOfGather: 0,
					nubmerofGatherWithoutChest: 0,
				};

				(tree.objective as any).calculatePriority(objectivePriority, tree, true);
				// console.log("check", tree, objectivePriority.numberOfObjectives, objectivePriority.numberOfGather, objectivePriority.numberOfAcquire);
				if (objectivePriority.numberOfObjectives <= objectivePriority.numberOfAcquire + objectivePriority.numberOfGather) {
					if (acquireItemGroup === undefined) {
						acquireItemGroup = tree.parent;
						acquireItemGroupIndex = index;
						// console.log("setting parent", acquireItemGroup, acquireItemGroupIndex);

					} else {
						// console.log("moving to new parent", tree);
						// move to the acquire item group
						if (tree.parent) {
							// remove from current parent
							tree.parent.children.splice(index, 1);
						}

						// add to new parent
						acquireItemGroup.children.splice(acquireItemGroupIndex! + 1, 0, tree);
					}
				}
			}

			// tree.children = tree.children.sort((treeA, treeB) => {
			// 	if (//treeA.objective.constructor === treeB.objective.constructor &&
			// 		// treeA.objective.getName() === treeB.objective.getName() &&
			// 		treeA.objective.sort && treeB.objective.sort) {
			// 		return treeA.objective.sort(this.context, treeA, treeB);
			// 	}

			// 	return 0;
			// });

			for (let i = 0; i < tree.children.length; i++) {
				const child = tree.children[i];
				if (!checked.has(child.id)) {
					checked.add(child.id);
					walkAndReorganizeTree(i, child);
				}
			}
		};

		// walkAndReorganizeTree(-1, tree);
		*/

		const walkAndSortTree = (tree: IExecutionTree) => {
			tree.children = tree.children.sort((treeA, treeB) => {
				if (//treeA.objective.constructor === treeB.objective.constructor &&
					// treeA.objective.getName() === treeB.objective.getName() &&
					treeA.objective.sort && treeB.objective.sort) {
					return treeA.objective.sort(this.context, treeA, treeB);
				}

				return 0;
			});

			for (const child of tree.children) {
				walkAndSortTree(child);
			}
		};

		walkAndSortTree(tree);

		// move all reserve item objectives to the top of the tree so they are executed first
		// this will prevent interrupt objectives from messing with these items
		if (reserveItemObjectives.size > 0) {
			const reserveItemObjective = new ReserveItems();
			reserveItemObjective.items = Array.from(reserveItemObjectives)
				.sort(([a], [b]) => a.localeCompare(b, navigator?.languages?.[0] ?? navigator.language, { numeric: true, ignorePunctuation: true }))
				.map(a => a[1])
				.flat();

			const reserveItemObjectiveTree: IExecutionTree = {
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

	private getObjectiveResults(chain: IObjective[] = [], objectiveStack: IObjectiveInfo[], currentObjectiveInfo: IObjectiveInfo, includeCurrent: boolean = true) {
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
				results.push(new Restart().setStatus("Determining objective..."));
				break;
			}

			results.push(nextObjectiveInfo.objective);

			offset++;
		}

		return results;
	}

}

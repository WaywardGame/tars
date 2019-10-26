import Log, { ILogLine, LogLineType } from "utilities/Log";

import Context from "../Context";
import { CalculatedDifficultyStatus, IObjective, IObjectiveInfo, ObjectiveResult } from "../IObjective";
import ReserveItems from "../Objectives/Core/ReserveItems";
import { createLog, discardNextMessage, processNextMessage, queueNextMessage } from "../Utilities/Logger";

import { IExecutionTree, IPlan } from "./IPlan";
import { IPlanner } from "./IPlanner";

/**
 * Represents a chain of objectives that can be executed in order to complete the plan.
 */
export default class Plan implements IPlan {

	private readonly log: Log;

	/**
	 * Full execution tree
	 */
	private readonly tree: IExecutionTree;

	/**
	 * Flattened list of objectives to execute
	 */
	private readonly objectives: IObjectiveInfo[];

	constructor(private readonly planner: IPlanner, private readonly context: Context, objective: IObjective, objectives: IObjectiveInfo[]) {
		this.log = createLog("Plan", objective.getHashCode());

		// this.tree = this.createExecutionTree(objective, objectives);
		this.tree = this.createOptimizedExecutionTree(objective, objectives);

		this.objectives = this.flattenTree(this.tree);

		this.log.debug(`Execution tree for ${objective} (context: ${context.getHashCode()}).`, this.tree, this.getTreeString(this.tree));
	}

	/**
	 * Executes the plan. It will continue executing objectives until it's done or isReady returns false
	 * @param postExecuteObjective Called after executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 */
	public async execute(preExecuteObjective: () => boolean, postExecuteObjective: () => boolean): Promise<IObjective[] | ObjectiveResult.Restart | boolean> {
		const chain: IObjective[] = [];
		const objectiveStack: IObjectiveInfo[] = [...this.objectives];

		if (objectiveStack.length > 1) {
			this.log.info("Executing plan", objectiveStack.map(objectiveInfo => objectiveInfo.objective.getIdentifier()).join(" -> "));
		}

		let dynamic = false;

		while (true) {
			const objectiveInfo = objectiveStack.shift();
			if (objectiveInfo === undefined) {
				break;
			}

			chain.push(objectiveInfo.objective);

			if (!preExecuteObjective()) {
				return false;
			}

			// queue this messsage to be logged if another message occurs
			let message = `Executing ${objectiveInfo.objective.getHashCode()}`;

			const contextHashCode = this.context.getHashCode();
			if (contextHashCode.length > 0) {
				message += `. Context hash code: ${contextHashCode}`;
			}

			queueNextMessage(objectiveInfo.objective.log, message);

			if (objectiveInfo.logs.length > 0) {
				for (const logLine of objectiveInfo.logs) {
					const method = LogLineType[logLine.type].toLowerCase();
					const func = (console as any)[method];
					if (func) {
						func(...logLine.args);
					}
				}

				processNextMessage();
			}

			const result = await objectiveInfo.objective.execute(this.context);

			if (result === ObjectiveResult.Ignore) {
				discardNextMessage();

			} else {
				processNextMessage();
			}

			if (result === ObjectiveResult.Pending) {
				// objective is still running

				// if (chain.length > 0) {
				// 	log.info(`Saving chain: ${chain.map((o) => o.getHashCode()).join(" -> ")}`);
				// }

				return chain;
			}

			if (result === ObjectiveResult.Restart) {
				return ObjectiveResult.Restart;
			}

			if (!postExecuteObjective()) {
				return false;
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

		return true;
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

		const reserveItemObjectives: IObjective[] = [];

		for (const { depth, objective, difficulty, logs } of objectives) {
			if (objective instanceof ReserveItems) {
				reserveItemObjectives.push(objective);
				continue;
			}

			const hashCode = objective.getHashCode();

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

		const walkAndSortTree = (tree: IExecutionTree) => {
			tree.children = tree.children.sort((treeA, treeB) => {
				if (treeA.objective.constructor === treeB.objective.constructor &&
					treeA.objective.getName() === treeB.objective.getName() &&
					treeA.objective.sort) {
					return treeA.objective.sort(treeA, treeB);
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
		tree.children.unshift(...reserveItemObjectives.map(objective => ({
			id: id++,
			depth: 1,
			objective: objective,
			hashCode: objective.getHashCode(),
			difficulty: 0,
			logs: [],
			children: [],
		})));

		return tree;
	}

	private getTreeString(root: IExecutionTree) {
		let str = "";

		const writeTree = (tree: IExecutionTree, depth = 0) => {
			str += `${"  ".repeat(depth)}${tree.hashCode}\n`;

			for (const child of tree.children) {
				writeTree(child, depth + 1);
			}
		};

		writeTree(root, 0);

		return str;
	}
}

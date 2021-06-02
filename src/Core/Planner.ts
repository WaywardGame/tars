import Log, { MemoryLog, nullLog } from "utilities/Log";

import Context from "../Context";
import ContextState from "../ContextState";
import { CalculatedDifficultyStatus, IObjective, IObjectiveInfo, ObjectivePipeline, ObjectiveResult, PossibleObjectivePipeline } from "../IObjective";
import { loggerUtilities } from "../utilities/Logger";

import { IPlanner } from "./IPlanner";
import Plan from "./Plan";

/**
 * Creates plans for executing objectives
 * 
 * The plan will contain the optimal tree for completing the objective
 * 
 * Related reading:
 *
 * https://en.wikipedia.org/wiki/Automated_planning_and_scheduling
 * https://en.wikipedia.org/wiki/Backward_chaining
 * https://en.wikipedia.org/wiki/Game_tree
 *
 * Or ask Spacetech about it
 */
class Planner implements IPlanner {

	/**
	 * Objective hash code -> calculated difficulty
	 */
	private readonly calculateDifficultyCache = new Map<string, ObjectivePipeline>();

	private calculatingDifficultyDepth = 0;
	private calculationLog: string[];

	private readonly _log: Log;

	constructor(private readonly debug = false) {
		this._log = loggerUtilities.createLog("Planner");
	}

	public get log(): Log {
		return this.calculatingDifficultyDepth <= 1 ? this._log : nullLog;
	}

	/**
	 * Returns true if a plan is currently being created
	 */
	public get isCreatingPlan(): boolean {
		return this.calculatingDifficultyDepth !== 0;
	}

	/**
	 * Reset the cached difficulties for objectives
	 */
	public reset() {
		this.calculateDifficultyCache.clear();
	}

	/**
	 * Creates a plan that completes the given objective
	 * @param context The context objective
	 * @param objective The objective for the Plan
	 * @returns The plan or undefined if no plan can be found
	 */
	public async createPlan(context: Context, objective: IObjective): Promise<Plan | undefined> {
		if (this.isCreatingPlan) {
			this._log.error(`Invalid difficulty depth ${this.calculatingDifficultyDepth}. Resetting to 0...`);
			this.calculatingDifficultyDepth = 0;
		}

		// reset the minimum accepted difficulty
		context.state.minimumAcceptedDifficulty = undefined;

		// the plan should be executed with the same context state it was created for
		// calculate the difficulty of the cloned context
		const result = await this.calculateDifficulty(context.clone(true, false), objective);

		if (result.status === CalculatedDifficultyStatus.Impossible ||
			result.status === CalculatedDifficultyStatus.NotCalculatedYet ||
			result.status === CalculatedDifficultyStatus.NotPlausible) {
			return undefined;
		}

		// shallow clone
		const objectiveInfo = result.objectiveChain[0];
		const objectives: IObjectiveInfo[] = result.objectiveChain.map(o => ({ ...o })).slice(1);

		return new Plan(this, context, objectiveInfo, objectives);
	}

	/**
	 * Determines the easiest objective pipeline to execute
	 * @param context The context
	 * @param objectives List of objective pipelines
	 * @returns The objective pipeline to execute
	 */
	public async pickEasiestObjectivePipeline(context: Context, objectives: IObjective[][]): Promise<ObjectivePipeline> {
		const start = performance.now();

		let easiestObjectivePipeline: PossibleObjectivePipeline | undefined;

		this.log.info(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);

		if (this.debug) {
			this.writeCalculationLog(`Determining easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${context.getHashCode()})`);
		}

		let result: ObjectivePipeline = {
			status: CalculatedDifficultyStatus.Impossible,
		};

		if (objectives.length === 0) {
			return result;
		}

		const clonedContext = context.clone(true);

		let includeHashCode = false;

		for (const objectivesSet of objectives) {
			const objectiveStartTime = performance.now();
			const objectivePipeline = await this.getObjectivePipeline(clonedContext, objectivesSet);
			const objectiveDeltaTime = performance.now() - objectiveStartTime;

			if (this.debug) {
				this.writeCalculationLog(`Returned "${CalculatedDifficultyStatus[objectivePipeline.status]}" for ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);
			}

			switch (objectivePipeline.status) {
				case CalculatedDifficultyStatus.Impossible:
					this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Impossible. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);

					if (objectivePipeline.changes && objectivePipeline.changes.includeHashCode) {
						// this pipeline was impossible because one or more required items were reserved
						// mark that the hash code should be included in the parent objectives
						includeHashCode = true;
					}

					break;

				case CalculatedDifficultyStatus.NotCalculatedYet:
					this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotCalculatedYet. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);

					if (result.status === CalculatedDifficultyStatus.Impossible) {
						result = objectivePipeline;

					} else if (this.debug) {
						this.writeCalculationLog("Not setting result");
					}

					break;

				case CalculatedDifficultyStatus.NotPlausible:
					this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: NotPlausible. Difficulty: ${objectivePipeline.minimumDifficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);

					if (result.status === CalculatedDifficultyStatus.NotPlausible) {
						if (result.minimumDifficulty > objectivePipeline.minimumDifficulty) {
							// only set result to the "easiest" NotPlausible objective
							result = objectivePipeline;

						} else if (this.debug) {
							this.writeCalculationLog("Not setting result");
						}

					} else if (result.status === CalculatedDifficultyStatus.Impossible) {
						result = objectivePipeline;

					} else if (this.debug) {
						this.writeCalculationLog("Not setting result");
					}

					break;

				case CalculatedDifficultyStatus.Possible:
					this.log.info(`Objective ${objectivesSet.map(o => o.getHashCode()).join(" -> ")}. Status: Possible. Difficulty: ${objectivePipeline.difficulty}. (time: ${objectiveDeltaTime.toFixed(2)}ms)`);

					if (easiestObjectivePipeline === undefined || easiestObjectivePipeline.difficulty > objectivePipeline.difficulty) {
						easiestObjectivePipeline = objectivePipeline;
						clonedContext.state.minimumAcceptedDifficulty = objectivePipeline.difficulty;

						if (this.debug) {
							this.writeCalculationLog(`Set minimumAcceptedDifficulty to "${objectivePipeline.difficulty}"`);
						}

					} else if (this.debug) {
						this.writeCalculationLog(`Not the easiest objective. "${easiestObjectivePipeline.difficulty} > ${objectivePipeline.difficulty}"`);
					}

					break;
			}
		}

		const time = performance.now() - start;

		if (this.debug) {
			this.writeCalculationLog(`Took ${time.toFixed(2)}ms`);
		}

		if (easiestObjectivePipeline) {
			this.log.info(`Easiest objective for ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} is ${easiestObjectivePipeline.objectives.map(o => o.getHashCode()).join(" -> ")} (difficulty: ${easiestObjectivePipeline.difficulty}) (time: ${time.toFixed(2)}ms)`);

			if (time >= 1000) {
				this._log.warn(`Took ${time.toFixed(2)}ms to determine the easiest objective. ${objectives.map(set => set.map(o => o.getHashCode()).join(" -> ")).join(", ")} (context: ${clonedContext.getHashCode()})`);

				if (time >= 2000) {
					if (this.debug) {
						this._log.warn(this.calculationLog.join(""));
						// throw new Error("Took too long!");
					}
				}
			}

			if (includeHashCode) {
				easiestObjectivePipeline.changes.includeHashCode = includeHashCode;
			}

			return easiestObjectivePipeline;
		}

		this.log.info(`All ${objectives.length} objectives are impossible (time: ${time.toFixed(2)}ms)`);

		return result;
	}

	private async getObjectivePipeline(context: Context, objectives: IObjective[]): Promise<ObjectivePipeline> {
		if (objectives.length === 0) {
			if (this.debug) {
				this.writeCalculationLog("No objectives returned");
			}

			return {
				status: CalculatedDifficultyStatus.Impossible,
			};
		}

		let difficulty = 0;

		const clonedContext = context.clone(true, true);

		const objectiveChain: IObjectiveInfo[] = [];

		const changes = new ContextState(clonedContext.state.depth);

		// this.log.info(`Objective pipeline ${objectives.map(o => o.getHashCode()).join(" -> ")}`);

		// console.log("\t".repeat(this.calculatingDifficulty), `Objective pipeline ${objectives.map(o => o.getHashCode()).join(" -> ")}`);

		for (const objective of objectives) {
			let calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);

			// this.log.info(`\tObjective ${objective.getHashCode()}. Difficulty: ${difficulty} ${objectives.length}`);

			if (calculatedDifficulty.status === CalculatedDifficultyStatus.Impossible ||
				calculatedDifficulty.status === CalculatedDifficultyStatus.NotCalculatedYet) {
				return calculatedDifficulty;
			}

			if (calculatedDifficulty.status === CalculatedDifficultyStatus.NotPlausible) {
				// NotPlausible is cached with a minimum difficulty

				// check if it's plausible for this pipeline
				if (!clonedContext.isPlausible(calculatedDifficulty.minimumDifficulty, true)) {
					if (this.debug) {
						this.writeCalculationLog(`Still not plausible. (${clonedContext.state.minimumAcceptedDifficulty} < ${calculatedDifficulty.minimumDifficulty})`);
					}

					return calculatedDifficulty;
				}

				// it's plausible. remove the cached result and recalculate
				if (this.debug) {
					this.writeCalculationLog(`Maybe plausible. Removing from cache. (${clonedContext.state.minimumAcceptedDifficulty} >= ${calculatedDifficulty.minimumDifficulty})`);
				}

				this.calculateDifficultyCache.delete(calculatedDifficulty.hashCode);

				calculatedDifficulty = await this.calculateDifficulty(clonedContext, objective);

				// this.log.info(`\tObjective ${objective.getHashCode()}. Difficulty: ${difficulty} ${objectives.length}`);

				if (calculatedDifficulty.status === CalculatedDifficultyStatus.Impossible ||
					calculatedDifficulty.status === CalculatedDifficultyStatus.NotCalculatedYet ||
					calculatedDifficulty.status === CalculatedDifficultyStatus.NotPlausible) {
					if (this.debug) {
						this.writeCalculationLog(`Still not plausible. ${CalculatedDifficultyStatus[calculatedDifficulty.status]}`);
					}
					return calculatedDifficulty;
				}
			}

			difficulty += calculatedDifficulty.difficulty;

			changes.merge(calculatedDifficulty.changes);

			if (!clonedContext.isPlausible(difficulty)) {
				if (this.debug) {
					this.writeCalculationLog(`Not plausible. ${difficulty} > minimumAcceptedDifficulty (${clonedContext.state.minimumAcceptedDifficulty})`);
				}

				return {
					hashCode: "NotPlausible",
					status: CalculatedDifficultyStatus.NotPlausible,
					minimumDifficulty: difficulty,
				};
			}

			// the first index should be this objective
			// if the difficulty was cached, the first index is the cached objective
			// we should make sure it's this objective
			objectiveChain.push(...calculatedDifficulty.objectiveChain.map((o, i) => ({
				depth: o.depth - (calculatedDifficulty as PossibleObjectivePipeline).depth + this.calculatingDifficultyDepth + 1,
				objective: i === 0 ? objective : o.objective,
				difficulty: o.difficulty,
				logs: o.logs,
			})));
		}

		return {
			status: CalculatedDifficultyStatus.Possible,
			depth: this.calculatingDifficultyDepth,
			changes: changes,
			objectives: objectives,
			objectiveChain: objectiveChain,
			difficulty: difficulty,
		};
	}

	private checkAndMergeDifficultyCache(context: Context, hashCode: string): ObjectivePipeline | undefined {
		if (this.debug) {
			this.writeCalculationLog(`Checking difficulty for "${hashCode}" (${context})`);
		}

		const cachedDifficulty = this.calculateDifficultyCache.get(hashCode);
		if (cachedDifficulty === undefined) {
			return undefined;
		}

		switch (cachedDifficulty.status) {
			case CalculatedDifficultyStatus.Impossible:
				if (this.debug) {
					this.writeCalculationLog(`Returning Impossible for "${hashCode}"`);
				}

				return cachedDifficulty;

			case CalculatedDifficultyStatus.NotCalculatedYet:
				if (this.debug) {
					this.writeCalculationLog(`Returning NotCalculatedYet for "${hashCode}"`);
				}

				return cachedDifficulty;

			case CalculatedDifficultyStatus.NotPlausible:
				if (this.debug) {
					this.writeCalculationLog(`Returning NotPlausible for "${hashCode}" (${hashCode})`);
				}

				return cachedDifficulty;

			case CalculatedDifficultyStatus.Possible:
				// update context with the changes this objective made
				context.merge(cachedDifficulty.changes);

				if (this.debug) {
					this.writeCalculationLog(`Returning cached difficulty ${cachedDifficulty.difficulty} for "${hashCode}" (${hashCode}) (changes: ${cachedDifficulty.changes.getHashCode()}) (depth ${cachedDifficulty.changes.depth}, ${context.state.depth}) (objective chain: ${cachedDifficulty.objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")})`);
				}

				return cachedDifficulty;
		}
	}

	private async calculateDifficulty(context: Context, objective: IObjective): Promise<ObjectivePipeline> {
		if (this.calculatingDifficultyDepth === 0) {
			this.calculationLog = [];
		}

		const objectiveHashCode = objective.getHashCode(context);

		// check the difficulty cache for the objective hash code (without context)
		let cachedDifficulty = this.checkAndMergeDifficultyCache(context, objectiveHashCode);
		if (cachedDifficulty !== undefined) {
			return cachedDifficulty;
		}

		let cacheHashCode = objectiveHashCode;
		let contextHashCode: string | undefined;
		let includedContextHashCode = false;

		// check if the context could effect the execution of the objective
		if (objective.canIncludeContextHashCode(context)) {
			contextHashCode = context.getHashCode();

			cachedDifficulty = this.checkAndMergeDifficultyCache(context, `${cacheHashCode}|${contextHashCode}`);
			if (cachedDifficulty !== undefined) {
				return cachedDifficulty;
			}

			if (objective.shouldIncludeContextHashCode(context)) {
				// it can effect the execution. include the hash code when checking or adding it to the cache
				includedContextHashCode = true;
				cacheHashCode += `|${contextHashCode}`;
			}
		}

		this.calculatingDifficultyDepth++;

		const waitingHashCodes: string[] = [];

		this.calculateDifficultyCache.set(objectiveHashCode, {
			hashCode: cacheHashCode,
			status: CalculatedDifficultyStatus.NotCalculatedYet,
			waitingHashCodes: waitingHashCodes,
		});

		let difficulty: number = objective.getDifficulty(context);

		let minimumDifficulty: number | undefined;

		const objectiveInfo: IObjectiveInfo = {
			depth: this.calculatingDifficultyDepth,
			objective: objective,
			difficulty: difficulty,
			logs: [],
		};

		const objectiveChain: IObjectiveInfo[] = [objectiveInfo];

		const memoryLog = new MemoryLog("MOD", "TARS", objectiveHashCode);
		memoryLog.setArray(objectiveInfo.logs);

		objective.setLogger(memoryLog);

		const changes = context.watchForChanges();

		let executionResult = await objective.execute(context);

		objective.setLogger(undefined);

		if (executionResult !== ObjectiveResult.Complete &&
			executionResult !== ObjectiveResult.Pending &&
			executionResult !== ObjectiveResult.Ignore &&
			executionResult !== ObjectiveResult.Restart) {
			if (typeof (executionResult) === "number") {
				if (executionResult === ObjectiveResult.Impossible) {
					difficulty = CalculatedDifficultyStatus.Impossible;

				} else if (!objective.isDifficultyOverridden()) {
					difficulty += executionResult;
				}

			} else {
				let isMultiplePipelines;

				if (!Array.isArray(executionResult)) {
					// treat it like a pipeline of one
					isMultiplePipelines = false;
					executionResult = [executionResult];

				} else {
					isMultiplePipelines = Array.isArray(executionResult[0]);
				}

				let pipelineResult: ObjectivePipeline | CalculatedDifficultyStatus;

				if (isMultiplePipelines) {
					if (this.debug) {
						this.writeCalculationLog(`Found ${executionResult.length} objective pipelines.`);
					}

					pipelineResult = await this.pickEasiestObjectivePipeline(context, executionResult as IObjective[][]);

				} else {
					if (this.debug) {
						this.writeCalculationLog(`Found objective pipeline with ${executionResult.length} objectives.`);
					}

					pipelineResult = await this.getObjectivePipeline(context, executionResult as IObjective[]);
				}

				if (pipelineResult.changes) {
					context.merge(pipelineResult.changes);
				}

				if (pipelineResult.status === CalculatedDifficultyStatus.Impossible ||
					pipelineResult.status === CalculatedDifficultyStatus.NotCalculatedYet ||
					pipelineResult.status === CalculatedDifficultyStatus.NotPlausible) {
					if (this.debug) {
						this.writeCalculationLog(`Pipeline returned ${CalculatedDifficultyStatus[pipelineResult.status]}.`);
					}

					difficulty = pipelineResult.status;

					if (pipelineResult.status === CalculatedDifficultyStatus.NotCalculatedYet) {
						if (this.debug) {
							this.writeCalculationLog(`Adding ${objectiveHashCode} to waiting hash codes for ${pipelineResult.hashCode} (${pipelineResult.waitingHashCodes.join(", ")})`);
						}

						pipelineResult.waitingHashCodes.push(objectiveHashCode);

						waitingHashCodes.push(...pipelineResult.waitingHashCodes);

					} else if (pipelineResult.status === CalculatedDifficultyStatus.NotPlausible) {
						minimumDifficulty = pipelineResult.minimumDifficulty;
					}

				} else {
					if (this.debug) {
						this.writeCalculationLog(`Pipeline difficulty: ${pipelineResult.difficulty}. Going to merge "${context.getHashCode()}" (depth: ${context.state.depth}) (objective chain: ${objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")}) with "${pipelineResult.changes.getHashCode()}" (depth ${pipelineResult.changes.depth}) (objective chain: ${pipelineResult.objectiveChain.map(o => `${o.depth},${o.objective}`).join(", ")})`);
					}

					difficulty += pipelineResult.difficulty;

					const depth = pipelineResult.depth;

					objectiveChain.push(...pipelineResult.objectiveChain.map(o => ({
						depth: o.depth - depth + this.calculatingDifficultyDepth,
						objective: o.objective,
						difficulty: o.difficulty,
						logs: o.logs,
					})));
				}
			}
		}

		context.unwatch();

		// delete NotCalculatedYet cache entry
		this.calculateDifficultyCache.delete(objectiveHashCode);

		let result: ObjectivePipeline;

		objectiveInfo.difficulty = difficulty;

		if (includedContextHashCode && !changes.shouldIncludeHashCode) {
			includedContextHashCode = false;
			cacheHashCode = objectiveHashCode;

			if (this.debug) {
				this.writeCalculationLog("No need to include the hash code");
			}
		}

		// todo: don't overload difficulty - it can be a number or CalculatedDifficultyStatus right now!
		switch (difficulty) {
			case CalculatedDifficultyStatus.Impossible:
				result = {
					status: CalculatedDifficultyStatus.Impossible,
					changes: changes,
				};

				break;

			case CalculatedDifficultyStatus.NotCalculatedYet:
				result = {
					status: CalculatedDifficultyStatus.NotCalculatedYet,
					hashCode: cacheHashCode,
					changes: changes,
					waitingHashCodes: [...waitingHashCodes],
				};

				break;

			case CalculatedDifficultyStatus.NotPlausible:
				result = {
					status: CalculatedDifficultyStatus.NotPlausible,
					hashCode: cacheHashCode,
					changes: changes,
					minimumDifficulty: minimumDifficulty!,
				};

				break;

			default:
				result = {
					status: CalculatedDifficultyStatus.Possible,
					changes: changes,
					difficulty: difficulty,
					depth: this.calculatingDifficultyDepth,
					objectives: [objective],
					objectiveChain: objectiveChain,
				};

				if (!includedContextHashCode && contextHashCode !== undefined && changes.shouldIncludeHashCode) {
					this.calculateDifficultyCache.delete(cacheHashCode);

					changes.includeHashCode = true;
					cacheHashCode += `|${contextHashCode}`;

					if (this.debug) {
						this.writeCalculationLog(`Changes detected. Going to include context hash code for "${cacheHashCode}" (context hash code: ${contextHashCode})`);
					}
				}

				if (this.debug) {
					this.writeCalculationLog(`Set "${cacheHashCode}" to ${difficulty}. changes: ${changes.getHashCode()} (depth: ${changes.depth})`);
				}

				break;
		}

		this.calculateDifficultyCache.set(cacheHashCode, result);

		if (this.debug) {
			this.writeCalculationLog(`Set "${cacheHashCode}" to ${CalculatedDifficultyStatus[result.status]}.`);
		}

		if (waitingHashCodes.length > 0) {
			if (this.debug) {
				this.writeCalculationLog(`Waiting hash codes: ${waitingHashCodes.join(", ")}`);
			}

			let clearWaitingHashCodes = false;
			if (result.status !== CalculatedDifficultyStatus.NotCalculatedYet) {
				clearWaitingHashCodes = true;

			} else if (waitingHashCodes.includes(objectiveHashCode)) {
				clearWaitingHashCodes = true;

				if (this.debug) {
					this.writeCalculationLog(`Waiting hash codes loop! (${objectiveHashCode})`);
				}
			}

			if (clearWaitingHashCodes) {
				if (this.debug) {
					this.writeCalculationLog(`Clearing waiting hash codes: ${waitingHashCodes.join(", ")}`);
				}

				for (const waitingHashCode of waitingHashCodes) {
					this.calculateDifficultyCache.delete(waitingHashCode);
				}

				waitingHashCodes.length = 0;
			}
		}

		this.calculatingDifficultyDepth--;

		if (this.calculatingDifficultyDepth === 0 && this.debug) {
			const logString = this.calculationLog.join("");
			this.log.debug(logString);
			// this.log.info("Objectives", context.state.objectives.map(({ depth, objective }) => `Depth ${depth}: ${objective.getHashCode()}`).join("\n"));
		}

		return result;
	}

	private writeCalculationLog(message: string): void {
		this.calculationLog.push(`${"\t".repeat(this.calculatingDifficultyDepth)}${message}\n`);
	}
}

const planner: IPlanner = new Planner(false);

export default planner;

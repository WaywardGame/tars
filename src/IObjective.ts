import { ActionType } from "game/entity/action/IAction";
import { DamageType } from "game/entity/IEntity";
import { ILog, ILogLine } from "utilities/Log";
import Context from "./Context";
import ContextState from "./ContextState";
import { IExecutionTree } from "./Core/IPlan";


export enum ObjectiveResult {
	// Objective was completed
	Complete = -1,

	// The objective is not finished yet. It's still being worked on
	Pending = -2,

	// Objective didn't do anything
	// Similar to Complete but this will prevent the objective from being logged as being executed
	Ignore = -3,

	// Objective tried to do something but couldn't yet. Indicate that we should fail and restart again on the next tick
	// An example would be acquiring an item and then trying to use that item - but item was undefined when the pipeline was created
	Restart = -4,

	// Objective cannot be executed. It's impossible
	Impossible = -5,
}

/**
 * Results can either be
 * 1. A single objective
 * 2. An array of objectives. The objectives will be executed in order
 * 3. An array of an array of objectives. The easiest objective array will be executed
 * 4. An ObjectiveResult, which usually indicates that the objective is impossible
 * 5. A number that represents the difficulty of the objective
 */
export type ObjectiveExecutionResult = IObjective | IObjective[] | IObjective[][] | ObjectiveResult | number;

export enum CalculatedDifficultyStatus {
	Impossible = -5,
	NotCalculatedYet = -6,
	NotPlausible = -7,
	Possible = -26,
}

export interface IObjective {
	readonly log: ILog;

	setLogger(log: ILog | undefined): void;

	execute(context: Context): Promise<ObjectiveExecutionResult>;

	getHashCode(context?: Context): string;
	getIdentifier(): string;
	getName(): string;

	/**
	 * Human readable status for what the objective is doing
	 */
	getStatusMessage(): string;

	sort?(context: Context, executionTreeA: IExecutionTree, executionTreeB: IExecutionTree): number;

	/**
	 * The result can change between the planning and execution phase
	 */
	isDynamic(): boolean;

	addDifficulty(difficulty: number): IObjective;
	getDifficulty(context: Context): number;
	isDifficultyOverridden(): boolean;

	/**
	 * Called when the player moves while this objective is running
	 */
	onMove(context: Context): Promise<IObjective | boolean>;

	/**
	 * Checks if the context could effect the execution of the objective
	 * @param context The context
	 */
	canIncludeContextHashCode(context: Context): boolean;

	/**
	 * Checks if the context could effect the execution of the objective
	 * Return true if the objective checks the context for items
	 * @param context The context
	 */
	shouldIncludeContextHashCode(context: Context): boolean;

	/**
	 * Shoud child objectives be able to be saved
	 */
	canSaveChildObjectives(): boolean;

	/**
	 * Can the objective be grouped with other objectives with the same identifier?
	 * It could cause the objective execution order to be re-sorted on the fly to make them execute one after another
	 */
	canGroupTogether(): boolean;
}

export interface IHandsEquipment {
	use: ActionType;
	preferredDamageType?: DamageType;
}

interface IBaseObjectivePipeline {
	status: CalculatedDifficultyStatus;
	changes?: ContextState;
}

export type ImpossibleObjectivePipeline = IBaseObjectivePipeline & {
	status: CalculatedDifficultyStatus.Impossible;
};

export type NotPlausibleObjectivePipeline = IBaseObjectivePipeline & {
	status: CalculatedDifficultyStatus.NotPlausible;
	hashCode: string;
	minimumDifficulty: number;
};

export type NotCalculatedYetObjectivePipeline = IBaseObjectivePipeline & {
	status: CalculatedDifficultyStatus.NotCalculatedYet;
	hashCode: string;
	waitingHashCodes: string[];
};

export type PossibleObjectivePipeline = Required<IBaseObjectivePipeline> & {
	status: CalculatedDifficultyStatus.Possible;
	depth: number;
	objectives: IObjective[];
	objectiveChain: IObjectiveInfo[];
	difficulty: number;
};

export type ObjectivePipeline = ImpossibleObjectivePipeline | NotCalculatedYetObjectivePipeline | PossibleObjectivePipeline | NotPlausibleObjectivePipeline;

export interface IObjectiveInfo {
	depth: number;
	objective: IObjective;
	difficulty: number;
	logs: ILogLine[];
}

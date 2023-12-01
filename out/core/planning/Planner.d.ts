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
import { LoggerUtilities } from "../../utilities/LoggerUtilities";
import type Context from "../context/Context";
import type { IObjective, ObjectivePipeline } from "../objective/IObjective";
import type { IPlanner } from "./IPlanner";
import Plan from "./Plan";
export declare class Planner implements IPlanner {
    private readonly loggerUtilities;
    debug: boolean;
    pendingTasks: number;
    private readonly calculateDifficultyCache;
    private calculatingDifficultyDepth;
    private readonly calculationLog;
    private objectivesCounter;
    private readonly log;
    constructor(loggerUtilities: LoggerUtilities, debug?: boolean);
    get shouldLog(): boolean;
    get isCreatingPlan(): boolean;
    reset(): void;
    createPlan(context: Context, objective: IObjective): Promise<Plan | undefined>;
    pickEasiestObjectivePipeline(context: Context, objectivesSets: IObjective[][]): Promise<ObjectivePipeline>;
    private getObjectivePipeline;
    private checkAndMergeDifficultyCache;
    private calculateDifficulty;
    private writeCalculationLog;
    private writeCalculationLogToConsoleAndReset;
}

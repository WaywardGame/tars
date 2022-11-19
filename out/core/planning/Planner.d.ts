import { LoggerUtilities } from "../../utilities/Logger";
import type Context from "../context/Context";
import type { IObjective, ObjectivePipeline } from "../objective/IObjective";
import type { IPlanner } from "./IPlanner";
import Plan from "./Plan";
export declare class Planner implements IPlanner {
    private readonly loggerUtilities;
    debug: boolean;
    private readonly calculateDifficultyCache;
    private calculatingDifficultyDepth;
    private calculationLog;
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
}

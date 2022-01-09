import type Context from "../context/Context";
import type { IObjective, ObjectivePipeline } from "../objective/IObjective";
import type { IPlan } from "./IPlan";
export interface IPlanner {
    readonly isCreatingPlan: boolean;
    debug: boolean;
    reset(): void;
    createPlan(context: Context, objective: IObjective): Promise<IPlan | undefined>;
    pickEasiestObjectivePipeline(context: Context, objectives: IObjective[][]): Promise<ObjectivePipeline>;
}

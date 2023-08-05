import Context from "../Context";
import { IObjective, ObjectivePipeline } from "../IObjective";
import { IPlan } from "./IPlan";
export interface IPlanner {
    readonly isCreatingPlan: boolean;
    debug: boolean;
    reset(): void;
    createPlan(context: Context, objective: IObjective): Promise<IPlan | undefined>;
    pickEasiestObjectivePipeline(context: Context, objectives: IObjective[][]): Promise<ObjectivePipeline>;
}

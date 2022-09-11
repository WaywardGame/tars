import Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
export declare abstract class BaseMode {
    protected getCommonInitialObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
    protected getBuildAnotherChestObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

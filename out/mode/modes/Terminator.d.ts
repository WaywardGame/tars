import Context from "../../Context";
import { IObjective } from "../../IObjective";
import { ITarsMode } from "../IMode";
export declare class TerminatorMode implements ITarsMode {
    private finished;
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

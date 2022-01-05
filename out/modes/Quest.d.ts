import Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
import { ITarsMode } from "../core/mode/IMode";
export declare class QuestMode implements ITarsMode {
    private finished;
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

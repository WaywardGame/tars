import type Context from "../core/context/Context";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
export declare class TerminatorMode implements ITarsMode {
    private finished;
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

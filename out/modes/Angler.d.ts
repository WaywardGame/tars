import type Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";
export declare class AnglerMode extends BaseMode implements ITarsMode {
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}
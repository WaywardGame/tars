import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
export declare enum TreasureHunterType {
    OnlyDiscoverTreasure = 0,
    DiscoverAndUnlockTreasure = 1,
    ObtainTreasure = 2
}
export declare class TreasureHunterMode implements ITarsMode {
    private finished;
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

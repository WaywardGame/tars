import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export declare enum MoveToWaterType {
    AnyWater = 0,
    SailAwayWater = 1,
    FishableWater = 2
}
export interface IMoveToWaterOptions {
    fishingRange: number;
    disallowBoats: boolean;
    moveToAdjacentTile: boolean;
}
export default class MoveToWater extends Objective {
    private readonly waterType;
    private readonly options?;
    constructor(waterType: MoveToWaterType, options?: Partial<IMoveToWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

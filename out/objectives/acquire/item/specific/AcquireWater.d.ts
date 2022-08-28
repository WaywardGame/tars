import type Context from "../../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import { IAcquireItemOptions } from "../AcquireBase";
export interface IAcquireWaterOptions extends IAcquireItemOptions {
    onlySafeToDrink: boolean;
    onlyForDesalination: boolean;
}
export default class AcquireWater extends Objective {
    private readonly options?;
    constructor(options?: Partial<IAcquireWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { IInventoryItems, ReserveType } from "../../../core/ITars";
import Objective from "../../../core/objective/Objective";
export interface IAcquireInventoryItemOptions {
    reserveType: ReserveType;
    skipHardReservedItems: boolean;
    desiredCount: number;
}
export default class AcquireInventoryItem extends Objective {
    private readonly inventoryKey;
    private readonly options?;
    constructor(inventoryKey: keyof IInventoryItems, options?: Partial<IAcquireInventoryItemOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private addPipeline;
}

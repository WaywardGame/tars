/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
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
    private getObjectivePipeline;
}

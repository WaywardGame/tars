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
import type { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { IExecutionTree } from "../../../core/planning/IPlan";
import Objective from "../../../core/objective/Objective";
import { IObjective, IObjectivePriority } from "../../../core/objective/IObjective";
export interface IAcquireItemOptions extends IGatherItemOptions {
    disallowCreatureSearch: boolean;
    disallowDoodadSearch: boolean;
    excludeItemTypes: Set<ItemType>;
    disallowTerrain: boolean;
    disallowWell: boolean;
    allowCraftingForUnmetRequiredDoodads: boolean;
    allowStartingWaterStill: boolean;
    allowWaitingForWater: boolean;
    onlyIdleWhenWaitingForWaterStill?: boolean;
}
export interface IGatherItemOptions {
    requiredMinDur: number;
    requirePlayerCreatedIfCraftable: boolean;
    willDestroyItem: boolean;
}
export default abstract class AcquireBase extends Objective implements IObjective {
    getExecutionPriority(context: Context, tree: IExecutionTree): IObjectivePriority;
    private addResult;
    private addGatherObjectivePriorities;
    private addAcquireObjectivePriorities;
}

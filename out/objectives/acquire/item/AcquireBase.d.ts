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

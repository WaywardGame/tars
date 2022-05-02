import type { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { IExecutionTree } from "../../../core/planning/IPlan";
import Objective from "../../../core/objective/Objective";
import { IObjectivePriority } from "../../../core/objective/IObjective";
export interface IAcquireItemOptions extends IGatherItemOptions {
    disableCreatureSearch: boolean;
    disableDoodadSearch: boolean;
    excludeItemTypes: Set<ItemType>;
}
export interface IGatherItemOptions {
    requiredMinDur: number;
    requirePlayerCreatedIfCraftable: boolean;
    willDestroyItem: boolean;
}
export default abstract class AcquireBase extends Objective {
    getExecutionPriority(context: Context, tree: IExecutionTree): IObjectivePriority;
    private addResult;
    private addGatherObjectivePriorities;
    private addAcquireObjectivePriorities;
}

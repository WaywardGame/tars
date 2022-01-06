import type { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { IExecutionTree } from "../../../core/planning/IPlan";
import Objective from "../../../core/objective/Objective";
export interface IAcquireItemOptions extends IGatherItemOptions {
    disableCreatureSearch: boolean;
    disableDoodadSearch: boolean;
    excludeItemTypes: Set<ItemType>;
}
export interface IGatherItemOptions {
    requiredMinDur: number;
    requirePlayerCreatedIfCraftable: boolean;
}
export interface IObjectivePriority {
    priority: number;
    objectiveCount: number;
    acquireObjectiveCount: number;
    emptyAcquireObjectiveCount: number;
    gatherObjectiveCount: number;
    gatherWithoutChestObjectiveCount: number;
    craftsRequiringNoGatheringCount: number;
    regroupedChildrenCount: number;
}
export default abstract class AcquireBase extends Objective {
    sort(context: Context, executionTreeA: IExecutionTree<any>, executionTreeB: IExecutionTree<any>): number;
    calculatePriority(context: Context, tree: IExecutionTree): IObjectivePriority;
    addResult(source: IObjectivePriority, destination: IObjectivePriority): void;
    private addGatherObjectivePriorities;
    private addAcquireObjectivePriorities;
}

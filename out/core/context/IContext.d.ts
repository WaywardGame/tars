import Human from "game/entity/Human";
import type { IBase, IInventoryItems, IUtilities } from "../ITars";
export interface IContext {
    readonly human: Human;
    readonly base: IBase;
    readonly inventory: IInventoryItems;
    readonly utilities: IUtilities;
}
export declare enum ContextDataType {
    Tile = "Position",
    LastAcquiredItem = "LastAcquiredItem",
    LastBuiltDoodad = "LastBuiltDoodad",
    AllowOrganizingReservedItemsIntoIntermediateChest = "AllowOrganizingReservedItemsIntoIntermediateChest",
    NextActionAllowsIntermediateChest = "NextActionAllowsIntermediateChest",
    CanCraftFromIntermediateChest = "CanCraftFromIntermediateChest",
    PrioritizeBaseItems = "PrioritizeBaseItems",
    MovingToNewIsland = "MovingToNewIsland",
    DisableMoveAwayFromBaseItemOrganization = "DisableMoveAwayFromBaseItemOrganization",
    TamingCreature = "TamingCreature",
    KeepInInventoryItems = "KeepInInventoryItems",
    NearBase1 = "NearBase1",
    NearBase2 = "NearBase2",
    NearBase3 = "NearBase3",
    NearBase4 = "NearBase4"
}
export declare const nearBaseDataKeys: ContextDataType[];
export declare enum MovingToNewIslandState {
    None = 0,
    Preparing = 1,
    Ready = 2
}

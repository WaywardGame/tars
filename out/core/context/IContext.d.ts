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
    NearBase = "NearBase"
}
export declare enum MovingToNewIslandState {
    None = 0,
    Preparing = 1,
    Ready = 2
}

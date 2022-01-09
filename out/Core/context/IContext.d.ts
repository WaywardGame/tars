import type Player from "game/entity/player/Player";
import type { IBase, IInventoryItems, IUtilities } from "../ITars";
export interface IContext {
    readonly player: Player;
    readonly base: IBase;
    readonly inventory: IInventoryItems;
    readonly utilities: IUtilities;
}
export declare enum ContextDataType {
    Position = "Position",
    LastAcquiredItem = "LastAcquiredItem",
    LastBuiltDoodad = "LastBuiltDoodad",
    Item1 = "Item1",
    AllowOrganizingReservedItemsIntoIntermediateChest = "AllowOrganizingReservedItemsIntoIntermediateChest",
    NextActionAllowsIntermediateChest = "NextActionAllowsIntermediateChest",
    CanCraftFromIntermediateChest = "CanCraftFromIntermediateChest",
    PrioritizeBaseChests = "PrioritizeBaseChests",
    MovingToNewIsland = "MovingToNewIsland",
    DisableMoveAwayFromBaseItemOrganization = "DisableMoveAwayFromBaseItemOrganization",
    TamingCreature = "TamingCreature"
}
export declare enum MovingToNewIslandState {
    None = 0,
    Preparing = 1,
    Ready = 2
}

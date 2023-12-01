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
import Human from "@wayward/game/game/entity/Human";
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
    NearBase4 = "NearBase4",
    RecoverStamina = "RecoverStamina"
}
export declare const nearBaseDataKeys: ContextDataType[];
export declare enum MovingToNewIslandState {
    None = 0,
    Preparing = 1,
    Ready = 2
}

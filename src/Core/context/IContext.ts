import type Player from "game/entity/player/Player";
import type { IBase, IInventoryItems, IUtilities } from "../ITars";

export interface IContext {
	readonly player: Player;
	readonly base: IBase;
	readonly inventory: IInventoryItems;
	readonly utilities: IUtilities;
}

export enum ContextDataType {
	Position = "Position",
	LastAcquiredItem = "LastAcquiredItem",
	LastBuiltDoodad = "LastBuiltDoodad",

	/**
	 * Spot to store an item across the objective pipeline
	 */
	Item1 = "Item1",

	/**
	 * Allow the OrganizeInventory objective to move reserved items into the intermediate chest
	 */
	AllowOrganizingReservedItemsIntoIntermediateChest = "AllowOrganizingReservedItemsIntoIntermediateChest",

	/**
	 * The next recipe/dismantle in the execution tree allows the use of the intermediate chest
	 */
	NextActionAllowsIntermediateChest = "NextActionAllowsIntermediateChest",

	/**
	 * The next recipe can be crafted from the intermediate chest
	 */
	CanCraftFromIntermediateChest = "CanCraftFromIntermediateChest",

	/**
	 * Prioritize using items from base chest for the objective over gather out in the field
	 */
	PrioritizeBaseChests = "PrioritizeBaseChests",

	/**
	 * Set when TARS is moving to a new island
	 */
	MovingToNewIsland = "MovingToNewIsland",

	/**
	 * Disables moving items into intermediate chests when moving far away from the base
	 */
	DisableMoveAwayFromBaseItemOrganization = "DisableMoveAwayFromBaseItemOrganization",

	/**
	 * Disables attacking a creature when taming
	 */
	TamingCreature = "TamingCreature",

	/**
	 * Array of items that will not be moved into chests when overweight
	 */
	KeepInInventoryItems = "KeepInInventoryItems",
}

export enum MovingToNewIslandState {
	None,
	Preparing,
	Ready,
}

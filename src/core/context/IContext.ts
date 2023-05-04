import Human from "game/entity/Human";
import type { IBase, IInventoryItems, IUtilities } from "../ITars";

export interface IContext {
	readonly human: Human;
	readonly base: IBase;
	readonly inventory: IInventoryItems;
	readonly utilities: IUtilities;
}

export enum ContextDataType {
	Tile = "Position",
	LastAcquiredItem = "LastAcquiredItem",
	LastBuiltDoodad = "LastBuiltDoodad",

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
	 * Prioritize using items from the base for the objective over gathering out in the field
	 */
	PrioritizeBaseItems = "PrioritizeBaseItems",

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

	/**
	 * Set when TARS is near the base so it remembers that it should do "near base" things, even if it moves further away from the base while doing said things
	 */
	NearBase = "NearBase",
}

export enum MovingToNewIslandState {
	None,
	Preparing,
	Ready,
}

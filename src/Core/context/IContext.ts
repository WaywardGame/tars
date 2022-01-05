import Player from "game/entity/player/Player";
import { IBase, IInventoryItems } from "../ITars";

export interface IContext {
	readonly player: Player;
	readonly base: IBase;
	readonly inventory: IInventoryItems;
}

export enum ContextDataType {
	Position = "Position",
	LastAcquiredItem = "LastAcquiredItem",
	LastBuiltDoodad = "LastBuiltDoodad",
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
}

export enum MovingToNewIslandState {
	None,
	Preparing,
	Ready,
}

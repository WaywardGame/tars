import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { GrowingStage } from "@wayward/game/game/doodad/IDoodad";
import { DoodadType, DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import type Island from "@wayward/game/game/island/Island";
import type { IContainer, IItemDisassembly } from "@wayward/game/game/item/IItem";
import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { ITerrainLoot } from "@wayward/game/game/tile/TerrainResources";
import type Tile from "@wayward/game/game/tile/Tile";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";

import { StatusType } from "@wayward/game/game/entity/status/IStatus";
import type { TarsOverlay } from "../ui/TarsOverlay";
import type { ActionUtilities } from "../utilities/ActionUtilities";
import type { BaseUtilities } from "../utilities/BaseUtilities";
import type { CreatureUtilities } from "../utilities/CreatureUtilities";
import type { DoodadUtilities } from "../utilities/DoodadUtilities";
import type { ItemUtilities } from "../utilities/ItemUtilities";
import type { LoggerUtilities } from "../utilities/LoggerUtilities";
import type { MovementUtilities } from "../utilities/MovementUtilities";
import type { ObjectUtilities } from "../utilities/ObjectUtilities";
import type { PlayerUtilities } from "../utilities/PlayerUtilities";
import type { TileUtilities } from "../utilities/TileUtilities";
import type Context from "./context/Context";
import type { IContext } from "./context/IContext";
import type { ITarsOptions } from "./ITarsOptions";
import type Navigation from "./navigation/Navigation";

export const tickSpeed = 333;

export const defaultMaxTilesChecked = 3000;

export const tarsUniqueNpcType = "TARS";

export interface ITarsEvents {
	/**
	 * Emitted when TARS is enabled or disabled
	 */
	enableChange(enabled: boolean): void;

	/**
	 * Emitted when TARS options change
	 */
	optionsChange(options: ITarsOptions): void;

	/**
	 * Emitted when TARS status is changed
	 */
	statusChange(): void;

	modeFinished(mode: TarsMode, success: boolean): void;

	navigationChange(status: NavigationSystemState): void;

	quantumBurstChange(status: QuantumBurstStatus): void;

	unload(): void;
}

export enum NavigationSystemState {
	NotInitialized,
	Initializing,
	Initialized,
}

export enum QuantumBurstStatus {
	Start,
	CooldownStart,
	CooldownEnd,
}

export interface IUtilities {
	action: ActionUtilities;
	base: BaseUtilities;
	creature: CreatureUtilities;
	doodad: DoodadUtilities;
	item: ItemUtilities;
	logger: LoggerUtilities;
	movement: MovementUtilities;
	navigation: Navigation;
	object: ObjectUtilities;
	overlay: TarsOverlay;
	player: PlayerUtilities;
	tile: TileUtilities;

	ensureSailingMode(isSailing: boolean): Promise<void>;
}

export const chestTypes = new Map<ItemType, DoodadType>([
	[ItemType.CopperChest, DoodadType.CopperChest],
	[ItemType.IronChest, DoodadType.IronChest],
	[ItemType.OrnateWoodenChest, DoodadType.OrnateWoodenChest],
	[ItemType.WoodenChest, DoodadType.WoodenChest],
	[ItemType.WroughtIronChest, DoodadType.WroughtIronChest],
]);

export interface IBase {
	altar: Doodad[];
	anvil: Doodad[];
	campfire: Doodad[];
	chest: Doodad[];
	dripStone: Doodad[];
	furnace: Doodad[];
	intermediateChest: Doodad[];
	kiln: Doodad[];
	boat: Doodad[];
	solarStill: Doodad[];
	waterStill: Doodad[];
	well: Doodad[];

	buildAnotherChest: boolean;
	availableUnlimitedWellLocation: IVector3 | undefined;
}

export interface IBaseInfo {
	doodadTypes?: Array<DoodadType | DoodadTypeGroup>;
	litType?: DoodadType | DoodadTypeGroup;
	tryPlaceNear?: BaseInfoKey;
	nearBaseDistanceSq?: number;
	allowMultiple?: boolean;
	requireShallowWater?: boolean;
	openAreaRadius?: number;
	canAdd?(context: Context, target: Doodad): boolean;
	onAdd?(context: Context, target: Doodad): void;
	findTargets?(context: { island: Island; base: IBase }): Doodad[];
}

export type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;

export const baseInfo: Record<BaseInfoKey, IBaseInfo> = {
	altar: {
		doodadTypes: [DoodadTypeGroup.Altar],
		allowMultiple: true,
	},
	anvil: {
		doodadTypes: [DoodadTypeGroup.Anvil],
		tryPlaceNear: "kiln",
	},
	campfire: {
		doodadTypes: [DoodadTypeGroup.LitCampfire],
		litType: DoodadTypeGroup.LitCampfire,
		allowMultiple: true,
	},
	chest: {
		doodadTypes: Array.from(chestTypes.values()),
		allowMultiple: true,
		canAdd: (context: Context, target: Doodad) => {
			if (context.base.intermediateChest.includes(target)) {
				return false;
			}

			if (context.options.goodCitizen && multiplayer.isConnected && target.getBuilder() !== context.human) {
				// prevent using chests placed by others
				return false;
			}

			if (context.utilities.base.isTreasureChestLocation(context, target.tile)) {
				// don't allow treasure chests to be base chests
				return false;
			}

			return true;
		},
		onAdd: (context: Context) => {
			context.base.buildAnotherChest = false;
		},
	},
	dripStone: {
		doodadTypes: [DoodadTypeGroup.Dripstone],
		allowMultiple: true,
	},
	furnace: {
		doodadTypes: [DoodadTypeGroup.LitFurnace],
		litType: DoodadTypeGroup.LitFurnace,
		allowMultiple: true,
	},
	intermediateChest: {
		doodadTypes: Array.from(chestTypes.values()),
		findTargets: (context: { island: Island; base: IBase }) => {
			const sortedChests = context.base.chest
				.map(chest =>
				({
					chest: chest,
					weight: context.island.items.computeContainerWeight(chest as IContainer),
				}))
				.sort((a, b) => a.weight - b.weight);
			if (sortedChests.length > 0) {
				return [context.base.chest.splice(context.base.chest.indexOf(sortedChests[0].chest), 1)[0]];
			}

			return [];
		},
	},
	kiln: {
		doodadTypes: [DoodadTypeGroup.LitKiln],
		litType: DoodadTypeGroup.LitKiln,
		tryPlaceNear: "anvil",
	},
	boat: {
		doodadTypes: [DoodadType.Sailboat],
		nearBaseDistanceSq: Infinity,
		allowMultiple: true,
	},
	solarStill: {
		doodadTypes: [DoodadType.SolarStill],
		allowMultiple: true,
		requireShallowWater: true,
		nearBaseDistanceSq: Math.pow(28, 2),
	},
	waterStill: {
		doodadTypes: [DoodadTypeGroup.LitWaterStill],
		litType: DoodadTypeGroup.LitWaterStill,
		allowMultiple: true,
	},
	well: {
		doodadTypes: [DoodadTypeGroup.Well],
		allowMultiple: true,
	},
};

/**
 * Note: knife is our sharpened
 */
export interface IInventoryItems {
	altar?: Item;
	anvil?: Item;
	axe?: Item;
	backpack?: Item[];
	bandage?: Item;
	bed?: Item;
	butcher?: Item;
	campfire?: Item;
	chest?: Item;
	curePoison?: Item;
	dripStone?: Item;
	equipBack?: Item;
	equipChest?: Item;
	equipFeet?: Item;
	equipHands?: Item;
	equipHead?: Item;
	equipLegs?: Item;
	equipNeck?: Item;
	equipShield?: Item;
	equipSword?: Item;
	equipWaist?: Item;
	fireKindling?: Item[];
	fireStarter?: Item;
	fireTinder?: Item;
	fishing?: Item;
	food?: Item[];
	furnace?: Item;
	hammer?: Item;
	heal?: Item;
	hoe?: Item;
	intermediateChest?: Item;
	kiln?: Item;
	knife?: Item;
	lockPick?: Item;
	pickAxe?: Item;
	boat?: Item;
	shovel?: Item;
	solarStill?: Item;
	tongs?: Item;
	waterContainer?: Item[];
	waterStill?: Item;
	well?: Item;
}

export interface IInventoryItemInfo {
	itemTypes?: Array<ItemType | ItemTypeGroup> | ((context: IContext) => Array<ItemType | ItemTypeGroup>);
	actionTypes?: ActionType[];
	equipType?: EquipType;
	flags?: InventoryItemFlags;
	allowMultiple?: number;
	allowInChests?: boolean;
	allowOnTiles?: boolean;
	requiredMinDur?: number;
	cureStatus?: StatusType;
}

export type InventoryItemFlags = InventoryItemFlag | { flag: InventoryItemFlag; option: any };

export enum InventoryItemFlag {
	/**
	 * Picks the item with a higher worth. Default
	 */
	PreferHigherWorth,

	/**
	 * Picks the item with a higher action bonus for the given action.
	 */
	PreferHigherActionBonus,

	/**
	 * Picks the item with a higher tier for the given item group.
	 */
	PreferHigherTier,

	/**
	 * Picks the item with lower weight.
	 */
	PreferLowerWeight,

	/**
	 * Picks the item with the higher durability.
	 */
	PreferHigherDurability,

	/**
	 * Picks the item with the higher decay.
	 */
	PreferHigherDecay,
}

export const inventoryItemInfo: Record<keyof IInventoryItems, IInventoryItemInfo> = {
	altar: {
		itemTypes: [ItemTypeGroup.Altar],
		requiredMinDur: 1,
	},
	anvil: {
		itemTypes: [ItemTypeGroup.Anvil],
		requiredMinDur: 1,
	},
	axe: {
		itemTypes: [
			ItemType.BasaltAxe,
			// ItemType.BronzeAxle,
			// ItemType.BronzeDoubleAxe,
			ItemType.CopperAxe,
			ItemType.CopperDoubleAxe,
			ItemType.GraniteAxe,
			ItemType.IronAxe,
			ItemType.IronDoubleAxe,
			ItemType.SandstoneAxe,
			ItemType.WroughtIronAxe,
			ItemType.WroughtIronDoubleAxe,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Chop,
		},
	},
	backpack: {
		itemTypes: [
			ItemType.Backpack,
		],
		allowMultiple: 2,
	},
	bandage: {
		itemTypes: [
			ItemType.AloeVeraBandage,
			ItemType.Bandage,
			ItemType.CharcoalBandage,
			ItemType.PeatBandage,
		],
	},
	bed: {
		itemTypes: [ItemTypeGroup.Bedding],
		requiredMinDur: 1,
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Sleep,
		},
	},
	butcher: {
		actionTypes: [ActionType.Butcher],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Butcher,
		},
	},
	campfire: {
		itemTypes: [ItemTypeGroup.Campfire],
		requiredMinDur: 1,
	},
	curePoison: {
		actionTypes: [ActionType.Cure],
		cureStatus: StatusType.Poisoned,
	},
	chest: {
		itemTypes: Array.from(chestTypes.keys()),
		requiredMinDur: 1,
	},
	dripStone: {
		itemTypes: [ItemTypeGroup.Dripstone],
		requiredMinDur: 1,
	},
	equipBack: {
		equipType: EquipType.Back,
	},
	equipWaist: {
		equipType: EquipType.Waist,
	},
	equipChest: {
		equipType: EquipType.Chest,
	},
	equipFeet: {
		equipType: EquipType.Feet,
	},
	equipHands: {
		equipType: EquipType.Hands,
	},
	equipHead: {
		equipType: EquipType.Head,
	},
	equipLegs: {
		equipType: EquipType.Legs,
	},
	equipNeck: {
		equipType: EquipType.Neck,
	},
	equipShield: {
		itemTypes: [
			ItemType.BarkShield,
			// ItemType.BronzeKiteShield,
			ItemType.CopperBuckler,
			ItemType.IronHeater,
			ItemType.WoodenShield,
			ItemType.WroughtIronShield,
		],
	},
	equipSword: {
		itemTypes: [
			// ItemType.BronzeSword,
			ItemType.CopperShortSword,
			ItemType.GoldShortSword,
			ItemType.IronShortSword,
			ItemType.WoodenShortSword,
			ItemType.WroughtIronShortSword,
		],
	},
	fireKindling: {
		itemTypes: [ItemTypeGroup.Kindling],
		flags: InventoryItemFlag.PreferLowerWeight,
		allowMultiple: 5,
	},
	fireStarter: {
		itemTypes: [
			ItemType.BowDrill,
			ItemType.FirePlough,
			ItemType.HandDrill,
		],
		flags: InventoryItemFlag.PreferLowerWeight,
	},
	fireTinder: {
		itemTypes: [ItemTypeGroup.Tinder],
		flags: InventoryItemFlag.PreferLowerWeight,
	},
	fishing: {
		// actionTypes: [ActionType.Cast],
		itemTypes: [
			ItemType.FishingNet,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Cast,
		},
	},
	food: {
		itemTypes: context => Array.from(context.utilities.item.foodItemTypes),
		flags: InventoryItemFlag.PreferHigherDecay,
		allowMultiple: 5,
	},
	furnace: {
		itemTypes: [ItemTypeGroup.Furnace],
		requiredMinDur: 1,
	},
	hammer: {
		itemTypes: [ItemTypeGroup.Hammer],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Repair,
		},
	},
	heal: {
		actionTypes: [ActionType.Heal],
	},
	hoe: {
		actionTypes: [ActionType.Till],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Till,
		},
	},
	intermediateChest: {
		itemTypes: Array.from(chestTypes.keys()),
		requiredMinDur: 1,
	},
	kiln: {
		itemTypes: [ItemTypeGroup.Kiln],
		requiredMinDur: 1,
	},
	knife: {
		itemTypes: [
			ItemType.BasaltKnife,
			// ItemType.BronzeKnife,
			ItemType.CopperKnife,
			ItemType.GraniteKnife,
			ItemType.IronKnife,
			ItemType.ObsidianKnife,
			ItemType.SandstoneKnife,
			ItemType.WroughtIronKnife,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Butcher,
		},
	},
	tongs: {
		itemTypes: [ItemTypeGroup.Tongs],
		flags: {
			flag: InventoryItemFlag.PreferHigherTier,
			option: ItemTypeGroup.Tongs,
		},
	},
	lockPick: {
		actionTypes: [ActionType.Lockpick],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Lockpick,
		},
	},
	pickAxe: {
		itemTypes: [
			ItemType.BasaltPickaxe,
			// ItemType.BronzePickaxe,
			ItemType.CopperPickaxe,
			ItemType.GranitePickaxe,
			ItemType.IronPickaxe,
			ItemType.WroughtIronPickaxe,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Mine,
		},
	},
	boat: {
		itemTypes: [ItemType.Sailboat],
		// allowInChests: true,
		// allowOnTiles: true,
	},
	shovel: {
		actionTypes: [ActionType.Dig],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Dig,
		},
	},
	solarStill: {
		itemTypes: [ItemType.SolarStill],
		requiredMinDur: 1,
	},
	waterContainer: {
		actionTypes: [ActionType.GatherLiquid],
		itemTypes: [
			ItemTypeGroup.ContainerOfDesalinatedWater,
			ItemTypeGroup.ContainerOfFilteredWater,
			ItemTypeGroup.ContainerOfPurifiedFreshWater,
			ItemTypeGroup.ContainerOfSeawater,
			ItemTypeGroup.ContainerOfUnpurifiedFreshWater,
		],
		allowMultiple: 4,
	},
	waterStill: {
		itemTypes: [ItemTypeGroup.WaterStill],
		requiredMinDur: 1,
	},
	well: {
		itemTypes: [
			ItemType.BasaltWell,
			ItemType.ClayWell,
			ItemType.GraniteWell,
			ItemType.SandstoneWell,
		],
		requiredMinDur: 1,
	},
};

// sorted by most important to least important
// const inventoryItemsToDrop: Array<keyof IInventoryItems> = [
//     "axe",
//     "pickAxe",
//     "campfire",
//     "fireStarter",
//     "fireKindling",
//     "fireTinder",
//     "shovel",
//     "knife",
//     "bed",
//     "heal",
//     "bandage",
//     "hammer",
//     "tongs",
// ];

export const inventoryBuildItems: Array<keyof IInventoryItems> = [
	"campfire",
	"dripStone",
	"waterStill",
	"chest",
	"kiln",
	"well",
	"furnace",
	"anvil",
	"solarStill",
	"boat",
	"altar",
];

export interface IBaseItemSearch {
	itemType: ItemType;
	extraDifficulty?: number;
}

export interface ItemSearch<T> extends IBaseItemSearch {
	type: T;
}

export type DoodadSearch = ItemSearch<DoodadType>;

export type DoodadSearchMap = Map<DoodadType, Map<GrowingStage, number>>;

export interface CreatureSearch {
	identifier: string;
	map: Map<CreatureType, ItemType[]>;
}

export interface ITerrainResourceSearch extends ItemSearch<TerrainType> {
	resource: ITerrainLoot;
}

export interface ITerrainWaterSearch extends ItemSearch<TerrainType> {
	gatherLiquid: ItemType;
}

export interface IDisassemblySearch {
	item: Item;
	disassemblyItems: IItemDisassembly[];
	requiredForDisassembly?: Array<ItemType | ItemTypeGroup>;
}

export interface ITileLocation {
	type: TerrainType;
	tile: Tile;
}

export enum TarsMode {
	Manual,
	Survival,
	TidyUp,
	Gardener,
	Harvester,
	Terminator,
	TreasureHunter,
	Quest,
	Angler,
}

export enum ReserveType {
	Soft,

	/**
	 * Hard means the item will be consumed
	 */
	Hard,
}

export interface IResetOptions {
	delete: boolean;
	resetContext: boolean;
	resetBase: boolean;
	resetInventory: boolean;
}

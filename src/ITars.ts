import { Events } from "event/EventEmitter";
import Doodad from "game/doodad/Doodad";
import { DoodadType, DoodadTypeGroup, GrowingStage } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import { IContainer, IItemDisassembly, ItemType, ItemTypeGroup } from "game/item/IItem";
import Item from "game/item/Item";
import { ITile, TerrainType } from "game/tile/ITerrain";
import { ITerrainLoot } from "game/tile/TerrainResources";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { IVector3 } from "utilities/math/IVector";
import Tars from "./Tars";
import { itemUtilities } from "./utilities/Item";

export const TARS_ID = "TARS";

export const defaultMaxTilesChecked = 3000;

export enum TarsTranslation {
	DialogTitleMain,

	DialogStatusNavigatingInitializing,

	DialogPanelGeneral,
	DialogPanelTasks,
	DialogPanelOptions,

	DialogButtonEnable,
	DialogButtonAquireItem,
	DialogButtonAquireItemTooltip,
	DialogButtonBuildDoodad,
	DialogButtonBuildDoodadTooltip,
	DialogButtonExploreIslands,
	DialogButtonExploreIslandsTooltip,
	DialogButtonStayHealthy,
	DialogButtonStayHealthyTooltip,
	DialogButtonUseOrbsOfInfluence,
	DialogButtonUseOrbsOfInfluenceTooltip,
	DialogButtonDeveloperMode,
	DialogButtonDeveloperModeTooltip,
	DialogButtonQuantumBurst,
	DialogButtonQuantumBurstTooltip,

	DialogLabelItem,
	DialogLabelDoodad,

	DialogModeSurvival,
	DialogModeSurvivalTooltip,
	DialogModeTidyUp,
	DialogModeTidyUpTooltip,
	DialogModeGardener,
	DialogModeGardenerTooltip,
}

export interface ISaveData {
	enabled: boolean;
	options: ITarsOptions;
	island: Record<string, Record<string, any>>;
	ui: Partial<Record<TarsUiSaveDataKey, any>>;
}

export enum TarsUiSaveDataKey {
	DialogOpened,
	ActivePanelId,
	AcquireItemDropdown,
	BuildDoodadDropdown,
}

// list of options. ideally most of them would be boolean's
export interface ITarsOptions {
	mode: TarsMode;
	exploreIslands: boolean;
	stayHealthy: boolean;
	useOrbsOfInfluence: boolean;
	quantumBurst: boolean;
	developerMode: boolean;
}

// options to show in the Options panel
export interface ITarsOptionSection {
	option: keyof Omit<ITarsOptions, "mode">;
	title: TarsTranslation;
	tooltip: TarsTranslation;
	isDisabled?: () => boolean;
}

export const uiConfigurableOptions: Array<ITarsOptionSection | undefined> = [
	{
		option: "exploreIslands",
		title: TarsTranslation.DialogButtonExploreIslands,
		tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
	},
	{
		option: "stayHealthy",
		title: TarsTranslation.DialogButtonStayHealthy,
		tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
	},
	{
		option: "useOrbsOfInfluence",
		title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
		tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
	},
	undefined, // creates a Divider
	{
		option: "quantumBurst",
		title: TarsTranslation.DialogButtonQuantumBurst,
		tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
	},
	{
		option: "developerMode",
		title: TarsTranslation.DialogButtonDeveloperMode,
		tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
	}
];

export interface ITileLocation {
	type: TerrainType;
	tile: ITile;
	point: IVector3;
}

export interface IBase {
	anvil: Doodad[];
	campfire: Doodad[];
	chest: Doodad[];
	furnace: Doodad[];
	intermediateChest: Doodad[];
	kiln: Doodad[];
	waterStill: Doodad[];
	well: Doodad[];
	buildAnotherChest: boolean;
	availableUnlimitedWellLocation: IVector3 | undefined;
}

export interface IBaseInfo {
	doodadTypes?: Array<DoodadType | DoodadTypeGroup>;
	litType?: DoodadType | DoodadTypeGroup;
	tryPlaceNear?: BaseInfoKey;
	allowMultiple?: boolean;
	openAreaRadius?: number;
	canAdd?(base: IBase, target: Doodad): boolean;
	onAdd?(base: IBase, target: Doodad): void;
	findTargets?(base: IBase): Doodad[];
}

export type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;

export const baseInfo: Record<BaseInfoKey, IBaseInfo> = {
	anvil: {
		doodadTypes: [DoodadTypeGroup.Anvil],
		tryPlaceNear: "kiln",
		// openAreaRadius: 0, // todo: verify this
	},
	campfire: {
		doodadTypes: [DoodadTypeGroup.LitCampfire],
		litType: DoodadTypeGroup.LitCampfire,
	},
	chest: {
		doodadTypes: [
			DoodadType.CopperChest,
			DoodadType.IronChest,
			DoodadType.OrnateWoodenChest,
			DoodadType.WoodenChest,
			DoodadType.WroughtIronChest,
		],
		allowMultiple: true,
		canAdd: (base: IBase, target: Doodad) => base.intermediateChest.indexOf(target) === -1,
		onAdd: (base: IBase) => {
			base.buildAnotherChest = false;
		},
	},
	furnace: {
		doodadTypes: [DoodadTypeGroup.LitFurnace],
		litType: DoodadTypeGroup.LitFurnace,
	},
	intermediateChest: {
		findTargets: (base: IBase) => {
			const sortedChests = base.chest
				.map(chest =>
				({
					chest: chest,
					weight: itemManager.computeContainerWeight(chest as IContainer),
				}))
				.sort((a, b) => a.weight - b.weight);
			if (sortedChests.length > 0) {
				return [base.chest.splice(base.chest.indexOf(sortedChests[0].chest), 1)[0]];
			}

			return [];
		},
	},
	kiln: {
		doodadTypes: [DoodadTypeGroup.LitKiln],
		litType: DoodadTypeGroup.LitKiln,
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
	anvil?: Item;
	axe?: Item;
	bandage?: Item;
	bed?: Item;
	campfire?: Item;
	carve?: Item;
	chest?: Item;
	equipBack?: Item;
	equipBelt?: Item;
	equipChest?: Item;
	equipFeet?: Item;
	equipHands?: Item;
	equipHead?: Item;
	equipLegs?: Item;
	equipNeck?: Item;
	equipShield?: Item;
	equipSword?: Item;
	fireKindling?: Item[];
	fireStarter?: Item;
	fireTinder?: Item;
	food?: Item[];
	furnace?: Item;
	hammer?: Item;
	heal?: Item;
	hoe?: Item;
	intermediateChest?: Item;
	kiln?: Item;
	knife?: Item;
	pickAxe?: Item;
	sailBoat?: Item;
	shovel?: Item;
	tongs?: Item;
	waterContainer?: Item[];
	waterStill?: Item;
	well?: Item;
}

export interface IInventoryItemInfo {
	itemTypes?: Array<ItemType | ItemTypeGroup>;
	actionTypes?: ActionType[];
	equipType?: EquipType;
	flags?: InventoryItemFlags;
	allowMultiple?: number;
	allowInChests?: boolean;
	allowOnTiles?: boolean;
	protect?: boolean;
	requiredMinDur?: number;
}

export type InventoryItemFlags = InventoryItemFlag | { flag: InventoryItemFlag; option: any; };

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
	anvil: {
		itemTypes: [ItemTypeGroup.Anvil],
		requiredMinDur: 1,
	},
	axe: {
		itemTypes: [
			ItemType.CopperAxe,
			ItemType.CopperDoubleAxe,
			ItemType.IronAxe,
			ItemType.IronDoubleAxe,
			ItemType.StoneAxe,
			ItemType.WroughtIronAxe,
			ItemType.WroughtIronDoubleAxe,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Gather,
		},
	},
	bandage: {
		itemTypes: [
			ItemType.Bandage,
			ItemType.PeatBandage,
			ItemType.CharcoalBandage,
			ItemType.AloeVeraBandage,
		],
	},
	bed: {
		itemTypes: [ItemTypeGroup.Bedding],
		requiredMinDur: 1,
	},
	campfire: {
		itemTypes: [ItemTypeGroup.Campfire],
		requiredMinDur: 1,
	},
	carve: {
		actionTypes: [ActionType.Carve],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Carve,
		},
	},
	chest: {
		itemTypes: [ItemType.WoodenChest],
		requiredMinDur: 1,
	},
	equipBack: {
		equipType: EquipType.Back,
	},
	equipBelt: {
		equipType: EquipType.Belt,
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
			ItemType.CopperBuckler,
			ItemType.IronHeater,
			ItemType.WoodenShield,
			ItemType.WroughtIronShield,
		],
		protect: true,
	},
	equipSword: {
		itemTypes: [
			ItemType.CopperSword,
			ItemType.GoldSword,
			ItemType.IronSword,
			ItemType.WoodenSword,
			ItemType.WroughtIronSword,
		],
		protect: true,
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
	food: {
		itemTypes: Array.from(itemUtilities.foodItemTypes),
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
		itemTypes: [
			ItemType.CopperChest,
			ItemType.IronChest,
			ItemType.OrnateWoodenChest,
			ItemType.WoodenChest,
			ItemType.WroughtIronChest,
		],
		requiredMinDur: 1,
	},
	kiln: {
		itemTypes: [ItemTypeGroup.Kiln],
		requiredMinDur: 1,
	},
	knife: {
		itemTypes: [
			ItemType.ObsidianKnife,
			ItemType.StoneKnife,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Carve,
		},
	},
	tongs: {
		itemTypes: [ItemTypeGroup.Tongs],
		flags: {
			flag: InventoryItemFlag.PreferHigherTier,
			option: ItemTypeGroup.Tongs,
		},
	},
	pickAxe: {
		itemTypes: [
			ItemType.CopperPickaxe,
			ItemType.IronPickaxe,
			ItemType.StonePickaxe,
			ItemType.WroughtIronPickaxe,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Gather,
		},
	},
	sailBoat: {
		itemTypes: [ItemType.Sailboat],
		allowInChests: true,
		allowOnTiles: true,
	},
	shovel: {
		actionTypes: [ActionType.Dig],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Dig,
		},
	},
	waterContainer: {
		actionTypes: [ActionType.GatherWater],
		itemTypes: [
			ItemTypeGroup.ContainerOfDesalinatedWater,
			ItemTypeGroup.ContainerOfMedicinalWater,
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
			ItemType.ClayWell,
			ItemType.SandstoneWell,
			ItemType.StoneWell,
		],
		requiredMinDur: 1,
	},
};

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

export type ITerrainSearch = ItemSearch<TerrainType> & { resource: ITerrainLoot; };

export interface IDisassemblySearch {
	item: Item;
	disassemblyItems: IItemDisassembly[];
	requiredForDisassembly?: Array<ItemType | ItemTypeGroup>;
}

export interface ITarsEvents extends Events<Mod> {
	/**
	 * Emitted when TARS is enabled or disabled
	 */
	enableChange(enabled: boolean): any;

	/**
	 * Emitted when TARS options change
	 */
	optionsChange(options: ITarsOptions): any;

	/**
	 * Emitted when TARS status is changed
	 */
	statusChange(status: Translation | string): any;
}

export enum TarsMode {
	Manual,
	Survival,
	TidyUp,
	Gardener,
}

let tars: Tars | undefined;

export function getTarsInstance() {
	if (!tars) {
		throw new Error("Invalid Tars instance");
	}

	return tars;
}

export function setTarsInstance(instance: Tars | undefined) {
	tars = instance;
}

export function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation {
	return getTarsInstance().getTranslation(translation);
}

export function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T] {
	return getTarsInstance().saveData[key];
}

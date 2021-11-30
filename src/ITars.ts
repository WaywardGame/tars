import { Events } from "event/EventEmitter";
import Doodad from "game/doodad/Doodad";
import { DoodadType, DoodadTypeGroup, GrowingStage } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import { IStatMax, Stat } from "game/entity/IStats";
import Player from "game/entity/player/Player";
import Island from "game/island/Island";
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

export interface IContext {
	readonly player: Player;
	readonly base: IBase;
	readonly inventory: IInventoryItems;
}

export enum TarsTranslation {
	DialogTitleMain,

	DialogStatusNavigatingInitializing,

	DialogPanelGeneral,
	DialogPanelTasks,
	DialogPanelMoveTo,
	DialogPanelOptions,

	DialogButtonEnable,
	DialogButtonAquireItem,
	DialogButtonAquireItemTooltip,
	DialogButtonBuildDoodad,
	DialogButtonBuildDoodadTooltip,
	DialogButtonExploreIslands,
	DialogButtonExploreIslandsTooltip,
	DialogButtonUseOrbsOfInfluence,
	DialogButtonUseOrbsOfInfluenceTooltip,
	DialogButtonStayHealthy,
	DialogButtonStayHealthyTooltip,
	DialogButtonDeveloperMode,
	DialogButtonDeveloperModeTooltip,
	DialogButtonQuantumBurst,
	DialogButtonQuantumBurstTooltip,

	DialogButtonMoveToBase,
	DialogButtonMoveToDoodad,
	DialogButtonMoveToIsland,
	DialogButtonMoveToNPC,
	DialogButtonMoveToPlayer,
	DialogButtonMoveToTerrain,

	DialogRangeLabel,
	DialogRangeRecoverHealthThreshold,
	DialogRangeRecoverHealthThresholdTooltip,
	DialogRangeRecoverStaminaThreshold,
	DialogRangeRecoverStaminaThresholdTooltip,
	DialogRangeRecoverHungerThreshold,
	DialogRangeRecoverHungerThresholdTooltip,
	DialogRangeRecoverThirstThreshold,
	DialogRangeRecoverThirstThresholdTooltip,

	DialogLabelAdvanced,
	DialogLabelDoodad,
	DialogLabelGeneral,
	DialogLabelIsland,
	DialogLabelItem,
	DialogLabelNPC,
	DialogLabelPlayer,
	DialogLabelRecoverThresholds,
	DialogLabelTerrain,

	DialogModeSurvival,
	DialogModeSurvivalTooltip,
	DialogModeTidyUp,
	DialogModeTidyUpTooltip,
	DialogModeGardener,
	DialogModeGardenerTooltip,
	DialogModeTerminator,
	DialogModeTerminatorTooltip,
	DialogModeQuest,
	DialogModeQuestTooltip,
}

export interface ISaveData {
	enabled: boolean;
	configuredThresholds?: boolean;
	options: ITarsOptions;
	island: Record<string, Record<string, any>>;
	ui: Partial<Record<TarsUiSaveDataKey, any>>;
}

export enum TarsUiSaveDataKey {
	DialogOpened,
	ActivePanelId,
	AcquireItemDropdown,
	BuildDoodadDropdown,
	MoveToIslandDropdown,
	MoveToTerrainDropdown,
	MoveToDoodadDropdown,
	MoveToPlayerDropdown,
	MoveToNPCDropdown,
}

// list of options. ideally most of them would be boolean's
export interface ITarsOptions {
	mode: TarsMode;

	exploreIslands: boolean;
	useOrbsOfInfluence: boolean;

	stayHealthy: boolean;
	recoverThresholdHealth: number;
	recoverThresholdStamina: number;
	recoverThresholdHunger: number;
	recoverThresholdThirst: number;
	recoverThresholdThirstFromMax: number;

	quantumBurst: boolean;
	developerMode: boolean;
}

// options to show in the Options panel
export interface ITarsOptionSection {
	option: keyof Omit<ITarsOptions, "mode">;
	title: TarsTranslation;
	tooltip: TarsTranslation;
	isDisabled?: () => boolean;
	slider?: {
		min: number | ((context: IContext) => number);
		max: number | ((context: IContext) => number)
	};
}

export const uiConfigurableOptions: Array<ITarsOptionSection | TarsTranslation | undefined> = [
	TarsTranslation.DialogLabelGeneral,
	{
		option: "exploreIslands",
		title: TarsTranslation.DialogButtonExploreIslands,
		tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
	},
	{
		option: "useOrbsOfInfluence",
		title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
		tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
	},
	{
		option: "stayHealthy",
		title: TarsTranslation.DialogButtonStayHealthy,
		tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
	},
	TarsTranslation.DialogLabelAdvanced,
	{
		option: "quantumBurst",
		title: TarsTranslation.DialogButtonQuantumBurst,
		tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
	},
	{
		option: "developerMode",
		title: TarsTranslation.DialogButtonDeveloperMode,
		tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
	},
	TarsTranslation.DialogLabelRecoverThresholds,
	{
		option: "recoverThresholdHealth",
		title: TarsTranslation.DialogRangeRecoverHealthThreshold,
		tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
		slider: {
			min: 0,
			max: (context) => context.player.stat.get<IStatMax>(Stat.Health).max,
		}
	},
	{
		option: "recoverThresholdStamina",
		title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
		tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
		slider: {
			min: 0,
			max: (context) => context.player.stat.get<IStatMax>(Stat.Stamina).max,
		}
	},
	{
		option: "recoverThresholdHunger",
		title: TarsTranslation.DialogRangeRecoverHungerThreshold,
		tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
		slider: {
			min: 0,
			max: (context) => context.player.stat.get<IStatMax>(Stat.Hunger).max,
		}
	},
	{
		option: "recoverThresholdThirst",
		title: TarsTranslation.DialogRangeRecoverThirstThreshold,
		tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
		slider: {
			min: 0,
			max: (context) => context.player.stat.get<IStatMax>(Stat.Thirst).max,
		}
	},
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
	findTargets?(context: { island: Island, base: IBase }): Doodad[];
}

export type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;

export const baseInfo: Record<BaseInfoKey, IBaseInfo> = {
	anvil: {
		doodadTypes: [DoodadTypeGroup.Anvil],
		tryPlaceNear: "kiln",
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
	butcher?: Item;
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
	itemTypes?: Array<ItemType | ItemTypeGroup> | (() => Array<ItemType | ItemTypeGroup>);
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
			option: ActionType.Chop,
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
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Sleep,
		},
	},
	campfire: {
		itemTypes: [ItemTypeGroup.Campfire],
		requiredMinDur: 1,
	},
	butcher: {
		actionTypes: [ActionType.Butcher],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Butcher,
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
		itemTypes: () => Array.from(itemUtilities.foodItemTypes),
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
	pickAxe: {
		itemTypes: [
			ItemType.CopperPickaxe,
			ItemType.IronPickaxe,
			ItemType.StonePickaxe,
			ItemType.WroughtIronPickaxe,
		],
		flags: {
			flag: InventoryItemFlag.PreferHigherActionBonus,
			option: ActionType.Mine,
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
		actionTypes: [ActionType.GatherLiquid],
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
	Terminator,
	Quest,
}

export enum ReserveType {
	Soft,
	Hard
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

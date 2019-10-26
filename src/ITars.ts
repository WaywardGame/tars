import Doodad from "doodad/Doodad";
import { DoodadType, DoodadTypeGroup, GrowingStage } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";
import { CreatureType } from "entity/creature/ICreature";
import { EquipType } from "entity/IHuman";
import { IContainer, ItemType, ItemTypeGroup } from "item/IItem";
import Item from "item/Item";
import { ITile, TerrainType } from "tile/ITerrain";
import { ITerrainLoot } from "tile/TerrainResources";
import { IVector3 } from "utilities/math/IVector";

export const defaultMaxTilesChecked = 3000;

export const gardenMaxTilesChecked = 1024;

export const desertCutoff = Number.MAX_SAFE_INTEGER; // 360

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
	placeNear?: BaseInfoKey;
	allowMultiple?: boolean;
	canAdd?(base: IBase, target: Doodad): boolean;
	onAdd?(base: IBase, target: Doodad): void;
	findTargets?(base: IBase): Doodad[];
}

export type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;

export const baseInfo: Record<BaseInfoKey, IBaseInfo> = {
	anvil: {
		doodadTypes: [DoodadTypeGroup.Anvil],
		placeNear: "kiln",
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
				.sort((a, b) => a.weight > b.weight ? 1 : -1);
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
	},
	well: {
		doodadTypes: [DoodadTypeGroup.Well],
		allowMultiple: true,
	},
};

export interface IInventoryItems {
	anvil?: Item;
	axe?: Item;
	bed?: Item;
	campfire?: Item;
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
	fireKindling?: Item;
	fireStarter?: Item;
	fireTinder?: Item;
	furnace?: Item;
	hammer?: Item;
	hoe?: Item;
	intermediateChest?: Item;
	kiln?: Item;
	knife?: Item;
	pickAxe?: Item;
	shovel?: Item;
	tongs?: Item;
	waterContainer?: Item;
	waterStill?: Item;
	well?: Item;
}

export interface IInventoryItemInfo {
	itemTypes?: Array<ItemType | ItemTypeGroup>;
	useTypes?: ActionType[];
	equipType?: EquipType;
	flags?: InventoryItemFlag;
}

export enum InventoryItemFlag {
	/**
	 * Picks the item with a higher worth. Default
	 */
	PreferHigherWorth = 0,

	/**
	 * Picks the item with lower weight.
	 */
	PreferLowerWeight = 1,
}

export const inventoryItemInfo: Record<keyof IInventoryItems, IInventoryItemInfo> = {
	anvil: {
		itemTypes: [ItemTypeGroup.Anvil],
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
	},
	bed: {
		itemTypes: [ItemTypeGroup.Bedding],
	},
	campfire: {
		itemTypes: [ItemTypeGroup.Campfire],
	},
	chest: {
		itemTypes: [ItemType.WoodenChest],
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
			ItemType.CopperShield,
			ItemType.IronShield,
			ItemType.WoodenShield,
			ItemType.WroughtIronShield,
		],
	},
	equipSword: {
		itemTypes: [
			ItemType.CopperSword,
			ItemType.GoldSword,
			ItemType.IronSword,
			ItemType.WoodenSword,
			ItemType.WroughtIronSword,
		],
	},
	fireKindling: {
		itemTypes: [ItemTypeGroup.Kindling],
		flags: InventoryItemFlag.PreferLowerWeight,
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
	furnace: {
		itemTypes: [ItemTypeGroup.Furnace],
	},
	hammer: {
		itemTypes: [ItemTypeGroup.Hammer],
	},
	hoe: {
		useTypes: [ActionType.Till],
	},
	intermediateChest: {
		itemTypes: [
			ItemType.CopperChest,
			ItemType.IronChest,
			ItemType.OrnateWoodenChest,
			ItemType.WoodenChest,
			ItemType.WroughtIronChest,
		],
	},
	kiln: {
		itemTypes: [ItemTypeGroup.Kiln],
	},
	knife: {
		itemTypes: [
			ItemType.ObsidianKnife,
			ItemType.StoneKnife,
		],
	},
	tongs: {
		itemTypes: [ItemTypeGroup.Tongs],
	},
	pickAxe: {
		itemTypes: [
			ItemType.CopperPickaxe,
			ItemType.IronPickaxe,
			ItemType.StonePickaxe,
			ItemType.WroughtIronPickaxe,
		],
	},
	shovel: {
		useTypes: [ActionType.Dig],
	},
	waterContainer: {
		useTypes: [ActionType.GatherWater],
		itemTypes: [
			ItemTypeGroup.ContainerOfDesalinatedWater,
			ItemTypeGroup.ContainerOfMedicinalWater,
			ItemTypeGroup.ContainerOfPurifiedFreshWater,
			ItemTypeGroup.ContainerOfSeawater,
			ItemTypeGroup.ContainerOfUnpurifiedFreshWater,
		],
	},
	waterStill: {
		itemTypes: [ItemTypeGroup.WaterStill],
	},
	well: {
		itemTypes: [
			ItemType.ClayBrickWell,
			ItemType.SandstoneWell,
			ItemType.StoneWell,
		],
	},
};

export interface ItemSearch<T> {
	type: T;
	itemType: ItemType;
}

export type DoodadSearch = ItemSearch<DoodadType> & { growingStage: GrowingStage };

export interface CreatureSearch {
	identifier: string;
	map: Map<CreatureType, ItemType[]>;
}

export type ITerrainSearch = ItemSearch<TerrainType> & { resource: ITerrainLoot };

import { IDoodad } from "doodad/IDoodad";
import { ActionType } from "action/IAction";
import { CreatureType, DoodadType, GrowingStage, ItemType, TerrainType } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";

export const defaultMaxTilesChecked = 3000;

export const gardenMaxTilesChecked = 1024;

export const desertCutoff = 512;

export interface ITileLocation {
	type: TerrainType;
	tile: ITile;
	point: IVector3;
}

export interface IBaseObjects<T> {
	campfire?: T;
	chests?: T[];
	kiln?: T;
	waterStill?: T;
	wells?: T[];
}

export type IBase = IBaseObjects<IDoodad>;

export type IInventoryBaseItems = IBaseObjects<IItem>;

export interface IInventoryItems extends IInventoryBaseItems {
	axe?: IItem;
	bed?: IItem;
	fireKindling?: IItem;
	fireStarter?: IItem;
	fireStoker?: IItem;
	fireTinder?: IItem;
	hammer?: IItem;
	hoe?: IItem;
	pickAxe?: IItem;
	sharpened?: IItem;
	shovel?: IItem;
	sword?: IItem;
	waterContainer?: IItem;
}

export interface IItemSearch<T> {
	type: T;
	itemType: ItemType;
}

export type IDoodadSearch = IItemSearch<DoodadType> & { growingStage: GrowingStage; action: ActionType };

export type ICreatureSearch = IItemSearch<CreatureType>;

export type ITerrainSearch = IItemSearch<TerrainType> & { chance: number };

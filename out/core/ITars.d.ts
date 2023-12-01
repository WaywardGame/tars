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
import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { GrowingStage } from "@wayward/game/game/doodad/IDoodad";
import { DoodadType, DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { StatusType } from "@wayward/game/game/entity/IEntity";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import type Island from "@wayward/game/game/island/Island";
import type { IItemDisassembly } from "@wayward/game/game/item/IItem";
import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { ITerrainLoot } from "@wayward/game/game/tile/TerrainResources";
import Tile from "@wayward/game/game/tile/Tile";
import { IVector3 } from "@wayward/game/utilities/math/IVector";
import { TarsOverlay } from "../ui/TarsOverlay";
import { ActionUtilities } from "../utilities/ActionUtilities";
import { BaseUtilities } from "../utilities/BaseUtilities";
import { CreatureUtilities } from "../utilities/CreatureUtilities";
import { DoodadUtilities } from "../utilities/DoodadUtilities";
import { ItemUtilities } from "../utilities/ItemUtilities";
import { LoggerUtilities } from "../utilities/LoggerUtilities";
import { MovementUtilities } from "../utilities/MovementUtilities";
import { ObjectUtilities } from "../utilities/ObjectUtilities";
import { PlayerUtilities } from "../utilities/PlayerUtilities";
import { TileUtilities } from "../utilities/TileUtilities";
import Context from "./context/Context";
import { IContext } from "./context/IContext";
import { ITarsOptions } from "./ITarsOptions";
import Navigation from "./navigation/Navigation";
export declare const tickSpeed = 333;
export declare const defaultMaxTilesChecked = 3000;
export declare const tarsUniqueNpcType = "TARS";
export interface ITarsEvents {
    enableChange(enabled: boolean): void;
    optionsChange(options: ITarsOptions): void;
    statusChange(): void;
    modeFinished(mode: TarsMode, success: boolean): void;
    navigationChange(status: NavigationSystemState): void;
    quantumBurstChange(status: QuantumBurstStatus): void;
    unload(): void;
}
export declare enum NavigationSystemState {
    NotInitialized = 0,
    Initializing = 1,
    Initialized = 2
}
export declare enum QuantumBurstStatus {
    Start = 0,
    CooldownStart = 1,
    CooldownEnd = 2
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
    ensureSailingMode?(sailingMode: boolean): Promise<void>;
}
export declare const chestTypes: Map<ItemType, DoodadType>;
export interface IBase {
    anvil: Doodad[];
    campfire: Doodad[];
    chest: Doodad[];
    dripStone: Doodad[];
    furnace: Doodad[];
    intermediateChest: Doodad[];
    kiln: Doodad[];
    sailboat: Doodad[];
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
    findTargets?(context: {
        island: Island;
        base: IBase;
    }): Doodad[];
}
export type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;
export declare const baseInfo: Record<BaseInfoKey, IBaseInfo>;
export interface IInventoryItems {
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
    sailboat?: Item;
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
export type InventoryItemFlags = InventoryItemFlag | {
    flag: InventoryItemFlag;
    option: any;
};
export declare enum InventoryItemFlag {
    PreferHigherWorth = 0,
    PreferHigherActionBonus = 1,
    PreferHigherTier = 2,
    PreferLowerWeight = 3,
    PreferHigherDurability = 4,
    PreferHigherDecay = 5
}
export declare const inventoryItemInfo: Record<keyof IInventoryItems, IInventoryItemInfo>;
export declare const inventoryBuildItems: Array<keyof IInventoryItems>;
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
export declare enum TarsMode {
    Manual = 0,
    Survival = 1,
    TidyUp = 2,
    Gardener = 3,
    Harvester = 4,
    Terminator = 5,
    TreasureHunter = 6,
    Quest = 7,
    Angler = 8
}
export declare enum ReserveType {
    Soft = 0,
    Hard = 1
}
export interface IResetOptions {
    delete: boolean;
    resetContext: boolean;
    resetBase: boolean;
    resetInventory: boolean;
}

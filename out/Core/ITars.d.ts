import type Doodad from "game/doodad/Doodad";
import type { GrowingStage } from "game/doodad/IDoodad";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import type { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import type Island from "game/island/Island";
import type { IItemDisassembly } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITile } from "game/tile/ITerrain";
import type { ITerrainLoot } from "game/tile/TerrainResources";
import type { TarsTranslation } from "../ITarsMod";
import { ActionUtilities } from "../utilities/Action";
import { BaseUtilities } from "../utilities/Base";
import { DoodadUtilities } from "../utilities/Doodad";
import { ItemUtilities } from "../utilities/Item";
import { MovementUtilities } from "../utilities/Movement";
import { ObjectUtilities } from "../utilities/Object";
import { PlayerUtilities } from "../utilities/Player";
import { TileUtilities } from "../utilities/Tile";
import { IContext } from "./context/IContext";
import Navigation from "./navigation/Navigation";
export declare const tickSpeed = 333;
export declare const defaultMaxTilesChecked = 3000;
export interface ITarsEvents {
    enableChange(enabled: boolean): void;
    optionsChange(options: ITarsOptions): void;
    statusChange(status: TarsTranslation | string): void;
    modeFinished(mode: TarsMode, success: boolean): void;
    navigationChange(status: NavigationSystemState): void;
    quantumBurstChange(status: QuantumBurstStatus): void;
    delete(): void;
}
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
    doodad: DoodadUtilities;
    item: ItemUtilities;
    movement: MovementUtilities;
    navigation: Navigation;
    object: ObjectUtilities;
    player: PlayerUtilities;
    tile: TileUtilities;
    ensureSailingMode(sailingMode: boolean): Promise<void>;
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
    findTargets?(context: {
        island: Island;
        base: IBase;
    }): Doodad[];
}
export declare type BaseInfoKey = Exclude<Exclude<keyof IBase, "buildAnotherChest">, "availableUnlimitedWellLocation">;
export declare const baseInfo: Record<BaseInfoKey, IBaseInfo>;
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
    itemTypes?: Array<ItemType | ItemTypeGroup> | ((context: IContext) => Array<ItemType | ItemTypeGroup>);
    actionTypes?: ActionType[];
    equipType?: EquipType;
    flags?: InventoryItemFlags;
    allowMultiple?: number;
    allowInChests?: boolean;
    allowOnTiles?: boolean;
    protect?: boolean;
    requiredMinDur?: number;
}
export declare type InventoryItemFlags = InventoryItemFlag | {
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
export interface IBaseItemSearch {
    itemType: ItemType;
    extraDifficulty?: number;
}
export interface ItemSearch<T> extends IBaseItemSearch {
    type: T;
}
export declare type DoodadSearch = ItemSearch<DoodadType>;
export declare type DoodadSearchMap = Map<DoodadType, Map<GrowingStage, number>>;
export interface CreatureSearch {
    identifier: string;
    map: Map<CreatureType, ItemType[]>;
}
export declare type ITerrainSearch = ItemSearch<TerrainType> & {
    resource: ITerrainLoot;
};
export interface IDisassemblySearch {
    item: Item;
    disassemblyItems: IItemDisassembly[];
    requiredForDisassembly?: Array<ItemType | ItemTypeGroup>;
}
export interface ITileLocation {
    type: TerrainType;
    tile: ITile;
    point: IVector3;
}
export declare enum TarsMode {
    Manual = 0,
    Survival = 1,
    TidyUp = 2,
    Gardener = 3,
    Terminator = 4,
    Quest = 5
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

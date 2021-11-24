import { Events } from "event/EventEmitter";
import Doodad from "game/doodad/Doodad";
import { DoodadType, DoodadTypeGroup, GrowingStage } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import Player from "game/entity/player/Player";
import Island from "game/island/Island";
import { IItemDisassembly, ItemType, ItemTypeGroup } from "game/item/IItem";
import Item from "game/item/Item";
import { ITile, TerrainType } from "game/tile/ITerrain";
import { ITerrainLoot } from "game/tile/TerrainResources";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { IVector3 } from "utilities/math/IVector";
import Tars from "./Tars";
export declare const TARS_ID = "TARS";
export declare const defaultMaxTilesChecked = 3000;
export interface IContext {
    readonly player: Player;
    readonly base: IBase;
    readonly inventory: IInventoryItems;
}
export declare enum TarsTranslation {
    DialogTitleMain = 0,
    DialogStatusNavigatingInitializing = 1,
    DialogPanelGeneral = 2,
    DialogPanelTasks = 3,
    DialogPanelMoveTo = 4,
    DialogPanelOptions = 5,
    DialogButtonEnable = 6,
    DialogButtonAquireItem = 7,
    DialogButtonAquireItemTooltip = 8,
    DialogButtonBuildDoodad = 9,
    DialogButtonBuildDoodadTooltip = 10,
    DialogButtonExploreIslands = 11,
    DialogButtonExploreIslandsTooltip = 12,
    DialogButtonUseOrbsOfInfluence = 13,
    DialogButtonUseOrbsOfInfluenceTooltip = 14,
    DialogButtonStayHealthy = 15,
    DialogButtonStayHealthyTooltip = 16,
    DialogButtonDeveloperMode = 17,
    DialogButtonDeveloperModeTooltip = 18,
    DialogButtonQuantumBurst = 19,
    DialogButtonQuantumBurstTooltip = 20,
    DialogButtonMoveToTerrain = 21,
    DialogButtonMoveToPlayer = 22,
    DialogButtonMoveToDoodad = 23,
    DialogButtonMoveToIsland = 24,
    DialogButtonMoveToBase = 25,
    DialogRangeLabel = 26,
    DialogRangeRecoverHealthThreshold = 27,
    DialogRangeRecoverHealthThresholdTooltip = 28,
    DialogRangeRecoverStaminaThreshold = 29,
    DialogRangeRecoverStaminaThresholdTooltip = 30,
    DialogRangeRecoverHungerThreshold = 31,
    DialogRangeRecoverHungerThresholdTooltip = 32,
    DialogRangeRecoverThirstThreshold = 33,
    DialogRangeRecoverThirstThresholdTooltip = 34,
    DialogLabelAdvanced = 35,
    DialogLabelDoodad = 36,
    DialogLabelGeneral = 37,
    DialogLabelIsland = 38,
    DialogLabelItem = 39,
    DialogLabelPlayer = 40,
    DialogLabelRecoverThresholds = 41,
    DialogLabelTerrain = 42,
    DialogModeSurvival = 43,
    DialogModeSurvivalTooltip = 44,
    DialogModeTidyUp = 45,
    DialogModeTidyUpTooltip = 46,
    DialogModeGardener = 47,
    DialogModeGardenerTooltip = 48
}
export interface ISaveData {
    enabled: boolean;
    configuredThresholds?: boolean;
    options: ITarsOptions;
    island: Record<string, Record<string, any>>;
    ui: Partial<Record<TarsUiSaveDataKey, any>>;
}
export declare enum TarsUiSaveDataKey {
    DialogOpened = 0,
    ActivePanelId = 1,
    AcquireItemDropdown = 2,
    BuildDoodadDropdown = 3,
    MoveToIslandDropdown = 4,
    MoveToTerrainDropdown = 5,
    MoveToDoodadDropdown = 6,
    MoveToPlayerDropdown = 7
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
export interface ITarsOptionSection {
    option: keyof Omit<ITarsOptions, "mode">;
    title: TarsTranslation;
    tooltip: TarsTranslation;
    isDisabled?: () => boolean;
    slider?: {
        min: number | ((context: IContext) => number);
        max: number | ((context: IContext) => number);
    };
}
export declare const uiConfigurableOptions: Array<ITarsOptionSection | TarsTranslation | undefined>;
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
export interface ITarsEvents extends Events<Mod> {
    enableChange(enabled: boolean): any;
    optionsChange(options: ITarsOptions): any;
    statusChange(status: Translation | string): any;
}
export declare enum TarsMode {
    Manual = 0,
    Survival = 1,
    TidyUp = 2,
    Gardener = 3
}
export declare enum ReserveType {
    Soft = 0,
    Hard = 1
}
export declare function getTarsInstance(): Tars;
export declare function setTarsInstance(instance: Tars | undefined): void;
export declare function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation;
export declare function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T];

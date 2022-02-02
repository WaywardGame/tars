import type Doodad from "game/doodad/Doodad";
import type { GrowingStage } from "game/doodad/IDoodad";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import type { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import type Island from "game/island/Island";
import type { IContainer, IItemDisassembly } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITile } from "game/tile/ITerrain";
import type { ITerrainLoot } from "game/tile/TerrainResources";
import { TarsOverlay } from "src/ui/TarsOverlay";

import type { TarsTranslation } from "../ITarsMod";
import { ActionUtilities } from "../utilities/Action";
import { BaseUtilities } from "../utilities/Base";
import { DoodadUtilities } from "../utilities/Doodad";
import { ItemUtilities } from "../utilities/Item";
import { MovementUtilities } from "../utilities/Movement";
import { ObjectUtilities } from "../utilities/Object";
import { PlayerUtilities } from "../utilities/Player";
import { TileUtilities } from "../utilities/Tile";
import Context from "./context/Context";
import { IContext } from "./context/IContext";
import Navigation from "./navigation/Navigation";

export const tickSpeed = 333;

export const defaultMaxTilesChecked = 3000;

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
    statusChange(status: TarsTranslation | string): void;

    modeFinished(mode: TarsMode, success: boolean): void;

    navigationChange(status: NavigationSystemState): void;

    quantumBurstChange(status: QuantumBurstStatus): void;

    delete(): void;
}

/**
 * List of options
 */
export interface ITarsOptions {
    mode: TarsMode;

    exploreIslands: boolean;
    useOrbsOfInfluence: boolean;

    goodCitizen: boolean;

    stayHealthy: boolean;
    recoverThresholdHealth: number;
    recoverThresholdStamina: number;
    recoverThresholdHunger: number;
    recoverThresholdThirst: number;
    recoverThresholdThirstFromMax: number;

    quantumBurst: boolean;
    developerMode: boolean;
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
    doodad: DoodadUtilities;
    item: ItemUtilities;
    movement: MovementUtilities;
    navigation: Navigation;
    object: ObjectUtilities;
    overlay: TarsOverlay;
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
        canAdd: (context: Context, target: Doodad) => {
            if (context.base.intermediateChest.includes(target)) {
                return false;
            }

            if (context.options.goodCitizen && multiplayer.isConnected() && target.getOwner() !== context.human) {
                return false;
            }

            return true;
        },
        onAdd: (context: Context) => {
            context.base.buildAnotherChest = false;
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
    anvil?: Item;
    axe?: Item;
    bandage?: Item;
    bed?: Item;
    butcher?: Item;
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
    protect?: boolean;
    requiredMinDur?: number;
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
        itemTypes: (context) => Array.from(context.utilities.item.foodItemTypes),
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
    solarStill: {
        itemTypes: [ItemType.SolarStill],
        requiredMinDur: 1,
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

export type ITerrainSearch = ItemSearch<TerrainType> & { resource: ITerrainLoot };

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

export enum TarsMode {
    Manual,
    Survival,
    TidyUp,
    Gardener,
    Harvester,
    Terminator,
    Quest,
}

export enum ReserveType {
    Soft,
    Hard
}

export interface IResetOptions {
    delete: boolean;
    resetContext: boolean;
    resetBase: boolean;
    resetInventory: boolean;
}

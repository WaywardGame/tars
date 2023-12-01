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
import type { DoodadType, DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { DamageType } from "@wayward/game/game/entity/IEntity";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type Creature from "@wayward/game/game/entity/creature/Creature";
import { IContainer, IRecipe, ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import ItemRecipeRequirementChecker from "@wayward/game/game/item/ItemRecipeRequirementChecker";
import type { TerrainType } from "@wayward/game/game/tile/ITerrain";
import { IGetItemsOptions } from "@wayward/game/game/item/IItemManager";
import { IDisassemblySearch } from "../core/ITars";
import type Context from "../core/context/Context";
export declare const defaultGetItemOptions: Readonly<Partial<IGetItemsOptions>>;
export declare enum RelatedItemType {
    All = 0,
    Recipe = 1,
    Disassemble = 2,
    Dismantle = 3
}
export interface IGetItemOptions {
    allowInventoryItems: boolean;
    allowUnsafeWaterContainers: boolean;
    onlyAllowReservedItems: boolean;
}
export declare class ItemUtilities {
    private static readonly relatedItemsCache;
    private static readonly relatedItemsByGroupCache;
    private static readonly dismantleSearchCache;
    foodItemTypes: Set<ItemType>;
    allSeedItemTypes: Set<ItemType>;
    edibleSeedItemTypes: Set<ItemType>;
    private availableInventoryWeightCache;
    private baseTileItemCache;
    private baseItemCache;
    private readonly groundItemCache;
    private readonly disassembleSearchCache;
    static getRelatedItemTypes(itemType: ItemType, relatedItemType: RelatedItemType): Set<ItemType> | boolean;
    static getRelatedItemTypesByGroup(itemTypeGroup: ItemTypeGroup): Set<ItemType> | boolean;
    static getDismantleSearch(itemType: ItemType): Set<ItemType>;
    initialize(context: Context): void;
    clearCache(): void;
    getBaseItems(context: Context): Item[];
    getBaseTileItems(context: Context): Set<Item>;
    getBaseItemsByType(context: Context, itemType: ItemType): Item[];
    getGroundItems(context: Context, itemType: ItemType): Item[];
    getDisassembleSearch(context: Context, itemType: ItemType): IDisassemblySearch[];
    isAllowedToUseItem(context: Context, item: Item, allowProtectedInventoryItems?: boolean): boolean;
    isAllowedToUseEquipItem(context: Context, item: Item): boolean;
    processRecipe(context: Context, recipe: IRecipe, useIntermediateChest: boolean, options?: Partial<IGetItemOptions>): ItemRecipeRequirementChecker;
    getItemsInContainer(context: Context, container: IContainer): Item[];
    getItemsInContainerByType(context: Context, container: IContainer, itemType: ItemType): Item[];
    getItemsInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup): Item[];
    getEquipmentItemsInInventory(context: Context): Item[];
    getItemsInInventory(context: Context): Item[];
    getItemInInventory(context: Context, itemTypeSearch: ItemType, options?: Partial<IGetItemOptions>): Item | undefined;
    getItemInContainer(context: Context, container: IContainer, itemTypeSearch: ItemType, options?: Partial<IGetItemOptions>): Item | undefined;
    getItemInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup, options?: Partial<IGetItemOptions>): Item | undefined;
    isInventoryItem(context: Context, item: Item, options?: Partial<IGetItemOptions>): boolean;
    canDestroyItem(context: Context, item: Item): boolean;
    isSafeToDrinkItem(context: Context, item: Item): boolean;
    isSafeToDrinkItemType(context: Context, itemType: ItemType): boolean;
    isDrinkableItem(item: Item): boolean;
    canGatherWater(item: Item): boolean;
    hasUseActionType(item: Item, actionType: ActionType): boolean;
    getTools(context: Context, actionType: ActionType, preferredDamageType?: DamageType): Item[];
    getBestTool(context: Context, use: ActionType, preferredDamageType?: DamageType): Item | undefined;
    getBestToolForDoodadGather(context: Context, doodad: Doodad): Item | undefined;
    getBestToolForTerrainGather(context: Context, terrainType: TerrainType): Item | undefined;
    getBestEquipment(context: Context, equip: EquipType): Item[];
    calculateEquipItemScore(item: Item): number;
    estimateWeaponDamage(context: Context, weapon: Item, target: Creature): number;
    updateHandEquipment(context: Context, preferredDamageType?: DamageType): {
        equipType: EquipType;
        item: Item;
    } | undefined;
    private getDesiredEquipment;
    getPossibleHandEquips(context: Context, actionType: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): Item[];
    getInventoryItemsWithEquipType(context: Context, equipType: EquipType): Item[];
    getInventoryItemsWithUse(context: Context, use: ActionType, filterEquipped?: boolean): Item[];
    getReservedItems(context: Context, includeKeepInInventoryItems: boolean): Item[];
    getItemsToBuild(context: Context): Item[];
    getUnusedItems(context: Context, options?: Partial<{
        allowReservedItems: boolean;
    }>): Item[];
    getAvailableInventoryWeight(context: Context): number;
    getSeeds(context: Context, onlyEdible: boolean): Item[];
    getInventoryItemForDoodad(context: Context, doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Item | undefined;
    getMoveItemToInventoryTarget(context: Context, item: Item): IContainer;
    getWaterContainers(context: Context): {
        safeToDrinkWaterContainers: Item[];
        availableWaterContainers: Item[];
    };
    private getFoodItemTypes;
    private getSeedItemTypes;
    private producesEdibleItem;
    private isEdible;
}

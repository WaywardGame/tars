import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { DamageType } from "game/entity/IEntity";
import { EquipType } from "game/entity/IHuman";
import { IRecipe, ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import ItemRecipeRequirementChecker from "game/item/ItemRecipeRequirementChecker";
import Doodad from "game/doodad/Doodad";
import { TerrainType } from "game/tile/ITerrain";
import Context from "../Context";
import { IDisassemblySearch } from "../ITars";
declare class ItemUtilities {
    foodItemTypes: Set<ItemType>;
    seedItemTypes: Set<ItemType>;
    private itemCache;
    private readonly disassembleSearchCache;
    initialize(context: Context): void;
    clearCache(): void;
    getBaseItems(context: Context): Item[];
    getDisassembleSearch(context: Context, itemType: ItemType): IDisassemblySearch[];
    processRecipe(context: Context, recipe: IRecipe, useIntermediateChest: boolean, allowInventoryItems?: boolean): ItemRecipeRequirementChecker;
    getItemsInInventory(context: Context): Item[];
    getItemInInventory(context: Context, itemTypeSearch: ItemType): Item | undefined;
    private getItemInContainer;
    isInventoryItem(context: Context, item: Item): boolean;
    isSafeToDrinkItem(item: Item): boolean;
    isDrinkableItem(item: Item): boolean;
    canGatherWater(item: Item): boolean;
    hasUseActionType(item: Item, actionType: ActionType): boolean;
    getTools(context: Context, actionType: ActionType, preferredDamageType?: DamageType): Item[];
    getBestTool(context: Context, use: ActionType, preferredDamageType?: DamageType): Item | undefined;
    getBestToolForDoodadGather(context: Context, doodad: Doodad): Item | undefined;
    getBestToolForTerrainGather(context: Context, terrainType: TerrainType): Item | undefined;
    getBestEquipment(context: Context, equip: EquipType): Item[];
    calculateEquipItemScore(item: Item): number;
    estimateDamageModifier(weapon: Item, target: Creature): number;
    getPossibleHandEquips(context: Context, actionType: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): Item[];
    getInventoryItemsWithEquipType(context: Context, equipType: EquipType): Item[];
    hasInventoryItemForAction(context: Context, actionType: ActionType): boolean;
    getInventoryItemsWithUse(context: Context, use: ActionType, filterEquipped?: boolean): Item[];
    getReservedItems(context: Context): Item[];
    getUnusedItems(context: Context, options?: Partial<{
        allowReservedItems: boolean;
        allowSailboat: boolean;
    }>): Item[];
    getAvailableInventoryWeight(context: Context): number;
    getSeeds(context: Context): Item[];
    getInventoryItemForDoodad(context: Context, doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Item | undefined;
    private getFoodItemTypes;
    private getSeedItemTypes;
    private isHealthyToEat;
}
export declare const itemUtilities: ItemUtilities;
export {};

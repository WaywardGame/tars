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
define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/creature/corpse/Corpses", "game/entity/creature/ICreature", "game/item/IItem", "game/item/ItemDescriptions", "game/tile/ITerrain", "game/tile/TerrainResources", "language/Dictionary", "language/Translation", "utilities/enum/Enums", "game/entity/action/actions/GatherLiquid", "../../../core/objective/IObjective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../core/UseProvidedItem", "../../gather/GatherFromBuilt", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource", "../../gather/GatherFromTerrainWater", "../../other/doodad/StartSolarStill", "../../other/doodad/StartWaterStillDesalination", "../../other/Idle", "./AcquireBase", "./AcquireItemAndIgnite", "./AcquireItemFromDisassemble", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe", "../../core/AddDifficulty", "game/tile/Terrains"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, Corpses_1, ICreature_1, IItem_1, ItemDescriptions_1, ITerrain_1, TerrainResources_1, Dictionary_1, Translation_1, Enums_1, GatherLiquid_1, IObjective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, UseProvidedItem_1, GatherFromBuilt_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1, GatherFromTerrainWater_1, StartSolarStill_1, StartWaterStillDesalination_1, Idle_1, AcquireBase_1, AcquireItemAndIgnite_1, AcquireItemFromDisassemble_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1, AddDifficulty_1, Terrains_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItem extends AcquireBase_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
        }
        getIdentifier() {
            return `AcquireItem:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType, Item_1.RelatedItemType.All);
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            this.log.info(`Acquiring ${IItem_1.ItemType[this.itemType]}...`);
            const itemDescription = ItemDescriptions_1.itemDescriptions[this.itemType];
            const objectivePipelines = [
                [new GatherFromGround_1.default(this.itemType, this.options).passAcquireData(this)],
                [new GatherFromChest_1.default(this.itemType, this.options).passAcquireData(this)],
                [new UseProvidedItem_1.default(this.itemType).passAcquireData(this)],
            ];
            const terrainResourceSearch = this.getTerrainResourceSearch(context);
            if (terrainResourceSearch.length > 0) {
                objectivePipelines.push([new GatherFromTerrainResource_1.default(terrainResourceSearch).passAcquireData(this)]);
            }
            if (!this.options.disallowDoodadSearch) {
                const doodadSearch = this.getDoodadSearch();
                if (doodadSearch.size > 0) {
                    objectivePipelines.push([new GatherFromDoodad_1.default(this.itemType, doodadSearch).passAcquireData(this)]);
                }
            }
            if (!this.options.disallowCreatureSearch) {
                const creatureSearch = this.getCreatureSearch();
                if (creatureSearch.map.size > 0) {
                    objectivePipelines.push([new GatherFromCorpse_1.default(creatureSearch).passAcquireData(this)]);
                    objectivePipelines.push([new GatherFromCreature_1.default(creatureSearch).passAcquireData(this)]);
                }
            }
            const dismantleSearch = Item_1.ItemUtilities.getDismantleSearch(this.itemType);
            if (dismantleSearch.size > 0) {
                objectivePipelines.push([new AcquireItemFromDismantle_1.default(this.itemType, dismantleSearch).passAcquireData(this)]);
            }
            const disassembleSearch = context.utilities.item.getDisassembleSearch(context, this.itemType);
            if (disassembleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDisassemble_1.default(this.itemType, disassembleSearch).passAcquireData(this)]);
            }
            if (itemDescription) {
                if (itemDescription.recipe) {
                    if (this.options.allowCraftingForUnmetRequiredDoodads ||
                        !itemDescription.recipe.requiredDoodads ||
                        (itemDescription.recipe.requiredDoodads && context.base.anvil.length > 0)) {
                        objectivePipelines.push([new AcquireItemWithRecipe_1.default(this.itemType, itemDescription.recipe).passAcquireData(this)]);
                    }
                }
                if (itemDescription.revert !== undefined) {
                    const revertItemDescription = ItemDescriptions_1.itemDescriptions[itemDescription.revert];
                    if (revertItemDescription?.lit === this.itemType) {
                        objectivePipelines.push([new AcquireItemAndIgnite_1.default(itemDescription.revert).passAcquireData(this)]);
                    }
                }
                if (itemDescription.returnOnUseAndDecay !== undefined) {
                    const returnOnUseAndDecayItemType = itemDescription.returnOnUseAndDecay.type;
                    const returnOnUseAndDecayItemDescription = ItemDescriptions_1.itemDescriptions[returnOnUseAndDecayItemType];
                    if (returnOnUseAndDecayItemDescription) {
                        if (!this.options?.disallowTerrain) {
                            const terrainWaterSearch = this.getTerrainWaterSearch(context, returnOnUseAndDecayItemType);
                            if (terrainWaterSearch.length > 0) {
                                const itemContextDataKey = this.getUniqueContextDataKey("WaterContainer");
                                const objectives = [];
                                const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, { allowUnsafeWaterContainers: true });
                                if (waterContainer) {
                                    objectives.push(new ReserveItems_1.default(waterContainer).passShouldKeepInInventory(this));
                                    objectives.push(new SetContextData_1.default(itemContextDataKey, waterContainer));
                                }
                                else {
                                    objectives.push(new AcquireItem(returnOnUseAndDecayItemType).passShouldKeepInInventory(this).setContextDataKey(itemContextDataKey));
                                }
                                objectives.push(new GatherFromTerrainWater_1.default(terrainWaterSearch, itemContextDataKey).passAcquireData(this));
                                objectivePipelines.push(objectives);
                            }
                        }
                        const doodads = context.utilities.object.findDoodads(context, "GatherLiquidDoodads", (doodad) => doodad.getLiquidGatherType() !== undefined);
                        for (const doodad of doodads) {
                            const liquidGatherType = doodad.getLiquidGatherType();
                            if (returnOnUseAndDecayItemDescription.liquidGather?.[liquidGatherType] !== this.itemType) {
                                continue;
                            }
                            const wellData = context.island.wellData[doodad.getTileId()];
                            if (wellData) {
                                if (this.options?.disallowWell || wellData.quantity === 0) {
                                    continue;
                                }
                            }
                            else if (!context.utilities.doodad.isWaterStillDrinkable(doodad)) {
                                if (this.options?.allowStartingWaterStill) {
                                    const objectives = [
                                        doodad.type === IDoodad_1.DoodadType.SolarStill ? new StartSolarStill_1.default(doodad) : new StartWaterStillDesalination_1.default(doodad),
                                    ];
                                    if (this.options?.allowWaitingForWater) {
                                        objectives.push(new AddDifficulty_1.default(100));
                                        if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
                                            objectives.push(new MoveToTarget_1.default(doodad, true, { range: 5 }));
                                        }
                                        objectives.push(new Idle_1.default());
                                    }
                                    objectivePipelines.push(objectives);
                                }
                                continue;
                            }
                            const itemContextDataKey = this.getUniqueContextDataKey(`WaterContainerFor${doodad.id}`);
                            const objectives = [];
                            const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, { allowUnsafeWaterContainers: true });
                            if (waterContainer) {
                                objectives.push(new ReserveItems_1.default(waterContainer).passShouldKeepInInventory(this));
                                objectives.push(new SetContextData_1.default(itemContextDataKey, waterContainer));
                            }
                            else {
                                objectives.push(new AcquireItem(returnOnUseAndDecayItemType).passShouldKeepInInventory(this).setContextDataKey(itemContextDataKey));
                            }
                            objectives.push(new MoveToTarget_1.default(doodad, true), new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                                genericAction: {
                                    action: GatherLiquid_1.default,
                                    args: (context) => {
                                        const item = context.getData(itemContextDataKey);
                                        if (!item?.isValid()) {
                                            this.log.warn("Invalid water container");
                                            return IObjective_1.ObjectiveResult.Restart;
                                        }
                                        return [item];
                                    },
                                },
                            })
                                .passAcquireData(this));
                            objectivePipelines.push(objectives);
                        }
                    }
                }
                const buildInfo = itemDescription.onUse?.[IAction_1.ActionType.Build];
                if (buildInfo !== undefined) {
                    objectivePipelines.push([new GatherFromBuilt_1.default(this.itemType, buildInfo.type).passAcquireData(this)]);
                }
            }
            return objectivePipelines;
        }
        getTerrainResourceSearch(context) {
            let search = AcquireItem.terrainResourceSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                let exclude = false;
                if (ItemDescriptions_1.itemDescriptions[this.itemType]?.use?.includes(IAction_1.ActionType.SetDown)) {
                    const isHousingOrTrack = context.island.items.isInGroup(this.itemType, IItem_1.ItemTypeGroup.Housing) || context.island.items.isInGroup(this.itemType, IItem_1.ItemTypeGroup.Track);
                    if (isHousingOrTrack) {
                        exclude = true;
                    }
                }
                if (!exclude && this.itemType !== IItem_1.ItemType.PlantRoots) {
                    const resolvedTypes = new Map();
                    const unresolvedTypes = Array.from(Enums_1.default.values(ITerrain_1.TerrainType));
                    while (unresolvedTypes.length > 0) {
                        const terrainType = unresolvedTypes.shift();
                        const terrainDescription = Terrains_1.terrainDescriptions[terrainType];
                        if (!terrainDescription) {
                            continue;
                        }
                        const leftOvers = terrainDescription.leftOvers;
                        if (leftOvers !== undefined) {
                            for (const leftOver of leftOvers) {
                                const leftOverType = leftOver.terrainType;
                                const leftOverSearch = resolvedTypes.get(leftOverType);
                                if (leftOverSearch === undefined) {
                                    unresolvedTypes.push(leftOverType);
                                    continue;
                                }
                            }
                        }
                        let terrainSearches = resolvedTypes.get(terrainType);
                        if (!terrainSearches) {
                            terrainSearches = [];
                            resolvedTypes.set(terrainType, terrainSearches);
                        }
                        const resource = TerrainResources_1.default[terrainType];
                        const terrainItems = context.island.getTerrainItems(resource);
                        if (resource && terrainItems && (resource.defaultItem === this.itemType || terrainItems.some(ri => ri.type === this.itemType))) {
                            const terrainSearch = {
                                type: terrainType,
                                itemType: this.itemType,
                                resource: resource,
                            };
                            search.push(terrainSearch);
                            terrainSearches.push(terrainSearch);
                        }
                        if (leftOvers) {
                            for (const leftOver of leftOvers) {
                                const terrainSearches = resolvedTypes.get(leftOver.terrainType);
                                if (terrainSearches) {
                                    for (const terrainSearch of terrainSearches) {
                                        search.push({
                                            type: terrainType,
                                            itemType: this.itemType,
                                            resource: terrainSearch.resource,
                                            extraDifficulty: 5 + ((100 - (leftOver.chance ?? 100)) * 5),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                AcquireItem.terrainResourceSearchCache.set(this.itemType, search);
            }
            return search;
        }
        getTerrainWaterSearch(context, returnOnUseAndDecayItemType) {
            let search = AcquireItem.terrainWaterSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                const baseItemDescriptions = ItemDescriptions_1.itemDescriptions[returnOnUseAndDecayItemType];
                if (baseItemDescriptions.liquidGather !== undefined) {
                    for (const terrainType of Enums_1.default.values(ITerrain_1.TerrainType)) {
                        const terrainDescription = Terrains_1.terrainDescriptions[terrainType];
                        if (!terrainDescription) {
                            continue;
                        }
                        const liquidGatherType = context.island.getLiquidGatherType(terrainType, terrainDescription);
                        if (liquidGatherType !== undefined && baseItemDescriptions.liquidGather[liquidGatherType] === this.itemType) {
                            search.push({
                                type: terrainType,
                                itemType: this.itemType,
                                gatherLiquid: returnOnUseAndDecayItemType,
                            });
                        }
                    }
                }
                AcquireItem.terrainWaterSearchCache.set(this.itemType, search);
            }
            return search;
        }
        getDoodadSearch() {
            let resolvedTypes = AcquireItem.doodadSearchCache.get(this.itemType);
            if (resolvedTypes === undefined) {
                resolvedTypes = new Map();
                const growingStages = Enums_1.default.values(IDoodad_1.GrowingStage);
                const unresolvedTypes = Array.from(Enums_1.default.values(IDoodad_1.DoodadType));
                while (unresolvedTypes.length > 0) {
                    const doodadType = unresolvedTypes.shift();
                    const doodadDescription = Doodads_1.doodadDescriptions[doodadType];
                    if (!doodadDescription) {
                        continue;
                    }
                    let leftOverSearch;
                    const leftOver = doodadDescription.leftOver;
                    if (leftOver !== undefined) {
                        leftOverSearch = resolvedTypes.get(leftOver);
                        if (leftOverSearch === undefined) {
                            unresolvedTypes.push(doodadType);
                            continue;
                        }
                    }
                    const searchMap = new Map();
                    resolvedTypes.set(doodadType, searchMap);
                    if (doodadDescription.gather && doodadType !== IDoodad_1.DoodadType.AppleTree) {
                        for (const growingStage of growingStages) {
                            const resourceItems = doodadDescription.gather[growingStage];
                            if (!resourceItems) {
                                continue;
                            }
                            if ((doodadDescription.isTall && growingStage >= IDoodad_1.GrowingStage.Budding) || growingStage >= IDoodad_1.GrowingStage.Ripening) {
                                for (const resourceItem of resourceItems) {
                                    if (resourceItem.type !== this.itemType) {
                                        continue;
                                    }
                                    searchMap.set(growingStage, 0);
                                    for (const growingStage2 of growingStages) {
                                        if (growingStage2 >= IDoodad_1.GrowingStage.Budding) {
                                            const growingStageDiff = growingStage - growingStage2;
                                            if (growingStageDiff > 0) {
                                                const existingDifficulty = searchMap.get(growingStage2);
                                                const difficulty = growingStageDiff * 3;
                                                if (existingDifficulty === undefined || existingDifficulty > difficulty) {
                                                    searchMap.set(growingStage2, growingStageDiff * 3);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (doodadDescription.harvest) {
                        for (const key of Object.keys(doodadDescription.harvest)) {
                            const growingStage = parseInt(key, 10);
                            const resourceItems = doodadDescription.harvest[growingStage];
                            if (!resourceItems) {
                                continue;
                            }
                            if (searchMap.has(growingStage)) {
                                continue;
                            }
                            for (const resourceItem of resourceItems) {
                                if (resourceItem.type !== this.itemType) {
                                    continue;
                                }
                                searchMap.set(growingStage, 0);
                                break;
                            }
                        }
                    }
                }
                for (const [resolvedDoodadType, resolvedSearchMap] of Array.from(resolvedTypes)) {
                    if (resolvedSearchMap.size === 0) {
                        resolvedTypes.delete(resolvedDoodadType);
                    }
                }
                AcquireItem.doodadSearchCache.set(this.itemType, resolvedTypes);
            }
            return resolvedTypes;
        }
        getCreatureSearch() {
            let search = AcquireItem.creatureSearchCache.get(this.itemType);
            if (search === undefined) {
                const map = new Map();
                for (const creatureType of Enums_1.default.values(ICreature_1.CreatureType)) {
                    if (creatureType !== ICreature_1.CreatureType.Shark) {
                        const corpseDescription = Corpses_1.corpseDescriptions[creatureType];
                        if (corpseDescription && corpseDescription.resource) {
                            for (const resource of corpseDescription.resource) {
                                if (resource.item === this.itemType) {
                                    let itemTypes = map.get(creatureType);
                                    if (!itemTypes) {
                                        itemTypes = [];
                                        map.set(creatureType, itemTypes);
                                    }
                                    itemTypes.push(this.itemType);
                                }
                            }
                        }
                    }
                }
                search = {
                    identifier: IItem_1.ItemType[this.itemType],
                    map: map,
                };
                AcquireItem.creatureSearchCache.set(this.itemType, search);
            }
            return search;
        }
    }
    AcquireItem.terrainResourceSearchCache = new Map();
    AcquireItem.terrainWaterSearchCache = new Map();
    AcquireItem.doodadSearchCache = new Map();
    AcquireItem.creatureSearchCache = new Map();
    exports.default = AcquireItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNkNILE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQixFQUFtQixVQUF3QyxFQUFFO1lBQzNHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBbUM7UUFFNUcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFFakQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDdEYsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxzQkFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQU01RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsbUNBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0sa0JB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
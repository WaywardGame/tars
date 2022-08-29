define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/creature/corpse/Corpses", "game/entity/creature/ICreature", "game/item/IItem", "game/item/ItemDescriptions", "game/tile/ITerrain", "game/tile/TerrainResources", "game/tile/Terrains", "language/Dictionary", "language/Translation", "utilities/enum/Enums", "game/entity/action/actions/GatherLiquid", "../../../core/objective/IObjective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../core/UseProvidedItem", "../../gather/GatherFromBuilt", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource", "../../gather/GatherFromTerrainWater", "../../other/doodad/StartSolarStill", "../../other/doodad/StartWaterStillDesalination", "../../other/Idle", "./AcquireBase", "./AcquireItemAndIgnite", "./AcquireItemFromDisassemble", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe", "../../core/AddDifficulty"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, Corpses_1, ICreature_1, IItem_1, ItemDescriptions_1, ITerrain_1, TerrainResources_1, Terrains_1, Dictionary_1, Translation_1, Enums_1, GatherLiquid_1, IObjective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, UseProvidedItem_1, GatherFromBuilt_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1, GatherFromTerrainWater_1, StartSolarStill_1, StartWaterStillDesalination_1, Idle_1, AcquireBase_1, AcquireItemAndIgnite_1, AcquireItemFromDisassemble_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1, AddDifficulty_1) {
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
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
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
                    objectivePipelines.push([new AcquireItemWithRecipe_1.default(this.itemType, itemDescription.recipe).passAcquireData(this)]);
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
                if (!ItemDescriptions_1.itemDescriptions[this.itemType]?.use?.includes(IAction_1.ActionType.SetDown) && this.itemType !== IItem_1.ItemType.PlantRoots) {
                    const resolvedTypes = new Map();
                    const unresolvedTypes = Array.from(Enums_1.default.values(ITerrain_1.TerrainType));
                    while (unresolvedTypes.length > 0) {
                        const terrainType = unresolvedTypes.shift();
                        const terrainDescription = Terrains_1.default[terrainType];
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
                        const terrainDescription = Terrains_1.default[terrainType];
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
                    const doodadDescription = Doodads_1.default[doodadType];
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
                        const corpseDescription = Corpses_1.default[creatureType];
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
    exports.default = AcquireItem;
    AcquireItem.terrainResourceSearchCache = new Map();
    AcquireItem.terrainWaterSearchCache = new Map();
    AcquireItem.doodadSearchCache = new Map();
    AcquireItem.creatureSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkNBLE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQixFQUFtQixVQUF3QyxFQUFFO1lBQzNHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBbUM7UUFFNUcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDakQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDdEYsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQU01RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsbUNBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0sa0JBQWtCLEdBQW1CO2dCQUMxQyxDQUFDLElBQUksMEJBQWdCLENBQUMs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
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
define(["require", "exports", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/action/actions/GatherLiquid", "@wayward/game/game/entity/creature/ICreature", "@wayward/game/game/entity/creature/corpse/Corpses", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/game/tile/ITerrain", "@wayward/game/game/tile/TerrainResources", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "@wayward/game/utilities/enum/Enums", "@wayward/game/game/tile/Terrains", "../../../core/objective/IObjective", "../../../utilities/ItemUtilities", "../../contextData/SetContextData", "../../core/AddDifficulty", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../core/UseProvidedItem", "../../gather/GatherFromBuilt", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource", "../../gather/GatherFromTerrainWater", "../../other/Idle", "../../other/doodad/StartWaterSourceDoodad", "./AcquireBase", "./AcquireItemAndIgnite", "./AcquireItemFromDisassemble", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, GatherLiquid_1, ICreature_1, Corpses_1, IItem_1, ItemDescriptions_1, ITerrain_1, TerrainResources_1, Dictionary_1, Translation_1, Enums_1, Terrains_1, IObjective_1, ItemUtilities_1, SetContextData_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, UseProvidedItem_1, GatherFromBuilt_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1, GatherFromTerrainWater_1, Idle_1, StartWaterSourceDoodad_1, AcquireBase_1, AcquireItemAndIgnite_1, AcquireItemFromDisassemble_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1) {
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
            return ItemUtilities_1.ItemUtilities.getRelatedItemTypes(this.itemType, ItemUtilities_1.RelatedItemType.All);
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
            const dismantleSearch = ItemUtilities_1.ItemUtilities.getDismantleSearch(this.itemType);
            if (dismantleSearch.size > 0) {
                objectivePipelines.push([new AcquireItemFromDismantle_1.default(this.itemType, dismantleSearch).passAcquireData(this)]);
            }
            const disassembleSearch = context.utilities.item.getDisassembleSearch(context, this.itemType);
            if (disassembleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDisassemble_1.default(this.itemType, disassembleSearch).passAcquireData(this)]);
            }
            if (itemDescription) {
                if (itemDescription.recipe && itemDescription.craftable !== false) {
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
                            else if (!context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
                                if (this.options?.allowStartingWaterSourceDoodads) {
                                    const objectives = [
                                        new StartWaterSourceDoodad_1.default(doodad),
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
                                        if (!item?.isValid) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNENILE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQixFQUFtQixVQUF3QyxFQUFFO1lBQzNHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBbUM7UUFFNUcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFFakQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDdEYsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLDZCQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSwrQkFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQU01RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsbUNBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0sa0JB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
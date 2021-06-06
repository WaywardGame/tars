define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/creature/corpse/Corpses", "game/entity/creature/ICreature", "game/item/IItem", "game/item/Items", "game/tile/ITerrain", "game/tile/TerrainResources", "game/tile/Terrains", "language/Dictionaries", "language/Translation", "utilities/enum/Enums", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrain", "./AcquireBase", "./AcquireItemFromDismantle", "./AcquireItemAndIgnite", "./AcquireItemWithRecipe", "../../../utilities/Item", "./AcquireItemFromDisassemble", "../../core/UseProvidedItem"], function (require, exports, Doodads_1, IDoodad_1, Corpses_1, ICreature_1, IItem_1, Items_1, ITerrain_1, TerrainResources_1, Terrains_1, Dictionaries_1, Translation_1, Enums_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1, AcquireBase_1, AcquireItemFromDismantle_1, AcquireItemAndIgnite_1, AcquireItemWithRecipe_1, Item_1, AcquireItemFromDisassemble_1, UseProvidedItem_1) {
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
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            this.log.info(`Acquiring ${IItem_1.ItemType[this.itemType]}...`);
            const itemDescription = Items_1.itemDescriptions[this.itemType];
            const objectivePipelines = [
                [new GatherFromGround_1.default(this.itemType).passContextDataKey(this)],
                [new GatherFromChest_1.default(this.itemType).passContextDataKey(this)],
                [new UseProvidedItem_1.default(this.itemType).passContextDataKey(this)],
            ];
            const terrainSearch = this.getTerrainSearch();
            if (terrainSearch.length > 0) {
                objectivePipelines.push([new GatherFromTerrain_1.default(terrainSearch).passContextDataKey(this)]);
            }
            if (!this.options.disableCreatureSearch) {
                const doodadSearch = this.getDoodadSearch();
                if (doodadSearch.size > 0) {
                    objectivePipelines.push([new GatherFromDoodad_1.default(this.itemType, doodadSearch).passContextDataKey(this)]);
                }
            }
            if (!this.options.disableCreatureSearch) {
                const creatureSearch = this.getCreatureSearch();
                if (creatureSearch.map.size > 0) {
                    objectivePipelines.push([new GatherFromCorpse_1.default(creatureSearch).passContextDataKey(this)]);
                    objectivePipelines.push([new GatherFromCreature_1.default(creatureSearch).passContextDataKey(this)]);
                }
            }
            const dismantleSearch = this.getDismantleSearch();
            if (dismantleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDismantle_1.default(this.itemType, dismantleSearch).passContextDataKey(this)]);
            }
            const disassembleSearch = Item_1.itemUtilities.getDisassembleSearch(context, this.itemType);
            if (disassembleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDisassemble_1.default(this.itemType, disassembleSearch).passContextDataKey(this)]);
            }
            if (itemDescription) {
                if (itemDescription.recipe) {
                    objectivePipelines.push([new AcquireItemWithRecipe_1.default(this.itemType, itemDescription.recipe).passContextDataKey(this)]);
                }
                if (itemDescription.revert !== undefined) {
                    const revertItemDescription = Items_1.itemDescriptions[itemDescription.revert];
                    if ((revertItemDescription === null || revertItemDescription === void 0 ? void 0 : revertItemDescription.lit) === this.itemType) {
                        objectivePipelines.push([new AcquireItemAndIgnite_1.default(itemDescription.revert).passContextDataKey(this)]);
                    }
                }
            }
            return objectivePipelines;
        }
        getTerrainSearch() {
            var _a;
            let search = AcquireItem.terrainSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                if (this.itemType !== IItem_1.ItemType.PlantRoots) {
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
                        if (resource && (resource.defaultItem === this.itemType || resource.items.some(ri => ri.type === this.itemType))) {
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
                                            extraDifficulty: 5 + ((100 - ((_a = leftOver.chance) !== null && _a !== void 0 ? _a : 100)) * 5),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                AcquireItem.terrainSearchCache.set(this.itemType, search);
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
        getDismantleSearch() {
            let search = AcquireItem.dismantleSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = Items_1.itemDescriptions[it];
                    if (description && description.dismantle) {
                        for (const di of description.dismantle.items) {
                            if (di.type === this.itemType) {
                                search.push(it);
                                break;
                            }
                        }
                    }
                }
                AcquireItem.dismantleSearchCache.set(this.itemType, search);
            }
            return search;
        }
    }
    exports.default = AcquireItem;
    AcquireItem.terrainSearchCache = new Map();
    AcquireItem.doodadSearchCache = new Map();
    AcquireItem.creatureSearchCache = new Map();
    AcquireItem.dismantleSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBK0JBLE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQixFQUFtQixVQUFxRixFQUFFO1lBQ3hKLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0Y7UUFFekosQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDakQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDdEYsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUVuRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXpELE1BQU0sZUFBZSxHQUFHLHdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV4RCxNQUFNLGtCQUFrQixHQUFtQjtnQkFDMUMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUQsQ0FBQyxJQUFJLHlCQUFlLENB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
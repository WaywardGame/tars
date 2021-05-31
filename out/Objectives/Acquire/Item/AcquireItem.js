define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/creature/corpse/Corpses", "game/entity/creature/ICreature", "game/item/IItem", "game/item/Items", "game/tile/ITerrain", "game/tile/TerrainResources", "game/tile/Terrains", "language/Dictionaries", "language/Translation", "utilities/enum/Enums", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrain", "./AcquireBase", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe"], function (require, exports, Doodads_1, IDoodad_1, Corpses_1, ICreature_1, IItem_1, Items_1, ITerrain_1, TerrainResources_1, Terrains_1, Dictionaries_1, Translation_1, Enums_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1, AcquireBase_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItem extends AcquireBase_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
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
        async execute() {
            this.log.info(`Acquiring ${IItem_1.ItemType[this.itemType]}...`);
            const itemDescription = Items_1.itemDescriptions[this.itemType];
            const objectivePipelines = [
                [new GatherFromGround_1.default(this.itemType).passContextDataKey(this)],
                [new GatherFromChest_1.default(this.itemType).passContextDataKey(this)],
            ];
            const terrainSearch = this.getTerrainSearch();
            if (terrainSearch.length > 0) {
                objectivePipelines.push([new GatherFromTerrain_1.default(terrainSearch).passContextDataKey(this)]);
            }
            const doodadSearch = this.getDoodadSearch();
            if (doodadSearch.size > 0) {
                objectivePipelines.push([new GatherFromDoodad_1.default(this.itemType, doodadSearch).passContextDataKey(this)]);
            }
            const creatureSearch = this.getCreatureSearch();
            if (creatureSearch.map.size > 0) {
                objectivePipelines.push([new GatherFromCorpse_1.default(creatureSearch).passContextDataKey(this)]);
                objectivePipelines.push([new GatherFromCreature_1.default(creatureSearch).passContextDataKey(this)]);
            }
            const dismantleSearch = this.getDismantleSearch();
            if (dismantleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDismantle_1.default(this.itemType, dismantleSearch).passContextDataKey(this)]);
            }
            if (itemDescription && itemDescription.recipe) {
                objectivePipelines.push([new AcquireItemWithRecipe_1.default(this.itemType, itemDescription.recipe).passContextDataKey(this)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZUFBZSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ3RGLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFFbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU87WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsd0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0sa0JBQWtCLEdBQW1CO2dCQUMxQyxDQUFDLElBQUksMEJBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5RCxDQUFDLElBQUkseUJBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7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
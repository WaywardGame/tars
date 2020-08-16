define(["require", "exports", "doodad/Doodads", "doodad/IDoodad", "entity/creature/corpse/Corpses", "entity/creature/ICreature", "item/IItem", "item/Items", "tile/ITerrain", "tile/TerrainResources", "utilities/enum/Enums", "../../Gather/GatherFromChest", "../../Gather/GatherFromCorpse", "../../Gather/GatherFromCreature", "../../Gather/GatherFromDoodad", "../../Gather/GatherFromGround", "../../Gather/GatherFromTerrain", "./AcquireBase", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe"], function (require, exports, Doodads_1, IDoodad_1, Corpses_1, ICreature_1, IItem_1, Items_1, ITerrain_1, TerrainResources_1, Enums_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1, AcquireBase_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1) {
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
            if (doodadSearch.length > 0) {
                objectivePipelines.push([new GatherFromDoodad_1.default(doodadSearch).passContextDataKey(this)]);
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
            let search = AcquireItem.terrainSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                if (this.itemType !== IItem_1.ItemType.PlantRoots) {
                    for (const tt of Enums_1.default.values(ITerrain_1.TerrainType)) {
                        const resource = TerrainResources_1.default[tt];
                        if (resource && (resource.defaultItem === this.itemType || resource.items.some(ri => ri.type === this.itemType))) {
                            search.push({
                                type: tt,
                                itemType: this.itemType,
                                resource: resource,
                            });
                        }
                    }
                }
                AcquireItem.terrainSearchCache.set(this.itemType, search);
            }
            return search;
        }
        getDoodadSearch() {
            let search = AcquireItem.doodadSearchCache.get(this.itemType);
            if (search === undefined) {
                search = [];
                const growingStages = Enums_1.default.values(IDoodad_1.GrowingStage);
                for (const doodadType of Enums_1.default.values(IDoodad_1.DoodadType)) {
                    const doodadDescription = Doodads_1.default[doodadType];
                    if (!doodadDescription) {
                        continue;
                    }
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
                                    search.push({
                                        type: doodadType,
                                        growingStage: growingStage,
                                        itemType: this.itemType,
                                    });
                                    for (const growingStage2 of growingStages) {
                                        if (growingStage2 >= IDoodad_1.GrowingStage.Budding) {
                                            const growingStageDiff = growingStage - growingStage2;
                                            if (growingStageDiff > 0) {
                                                search.push({
                                                    type: doodadType,
                                                    growingStage: growingStage2,
                                                    itemType: this.itemType,
                                                    extraDifficulty: growingStageDiff * 3,
                                                });
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
                            for (const resourceItem of resourceItems) {
                                if (resourceItem.type !== this.itemType) {
                                    continue;
                                }
                                search.push({
                                    type: doodadType,
                                    growingStage: growingStage,
                                    itemType: this.itemType,
                                });
                            }
                        }
                    }
                }
                AcquireItem.doodadSearchCache.set(this.itemType, search);
            }
            return search;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLFdBQVksU0FBUSxxQkFBVztRQU9uRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZUFBZSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFFbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU87WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsd0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0sa0JBQWtCLEdBQW1CO2dCQUMxQyxDQUFDLElBQUksMEJBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5RCxDQUFDLElBQUkseUJBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0QsQ0FBQztZQUVGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzlDLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pGO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzVDLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMEJBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZGO1lBRUQsTUFBTSxjQUFjLEdBQW1CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hFLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekYsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0Y7WUFFRCxNQUFNLGVBQWUsR0FBZSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM5RCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGtDQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pIO1lBRUQsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLE1BQU0sRUFBRTtnQkFDOUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckg7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUdaLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxnQkFBUSxDQUFDLFVBQVUsRUFBRTtvQkFDMUMsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFXLENBQUMsRUFBRTt3QkFDM0MsTUFBTSxRQUFRLEdBQUcsMEJBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3RDLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTs0QkFDakgsTUFBTSxDQUFDLElBQUksQ0FBQztnQ0FDWCxJQUFJLEVBQUUsRUFBRTtnQ0FDUixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0NBQ3ZCLFFBQVEsRUFBRSxRQUFROzZCQUNsQixDQUFDLENBQUM7eUJBQ0g7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzFEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sZUFBZTtZQUN0QixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosTUFBTSxhQUFhLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBWSxDQUFDLENBQUM7Z0JBRWpELEtBQUssTUFBTSxVQUFVLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLEVBQUU7b0JBQ2xELE1BQU0saUJBQWlCLEdBQUcsaUJBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUN2QixTQUFTO3FCQUNUO29CQUVELElBQUksaUJBQWlCLENBQUMsTUFBTSxJQUFJLFVBQVUsS0FBSyxvQkFBVSxDQUFDLFNBQVMsRUFBRTt3QkFDcEUsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7NEJBQ3pDLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDN0QsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQ0FDbkIsU0FBUzs2QkFDVDs0QkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxJQUFJLFlBQVksSUFBSSxzQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFlBQVksSUFBSSxzQkFBWSxDQUFDLFFBQVEsRUFBRTtnQ0FDaEgsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7b0NBQ3pDLElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO3dDQUN4QyxTQUFTO3FDQUNUO29DQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7d0NBQ1gsSUFBSSxFQUFFLFVBQVU7d0NBQ2hCLFlBQVksRUFBRSxZQUFZO3dDQUMxQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7cUNBQ3ZCLENBQUMsQ0FBQztvQ0FHSCxLQUFLLE1BQU0sYUFBYSxJQUFJLGFBQWEsRUFBRTt3Q0FDMUMsSUFBSSxhQUFhLElBQUksc0JBQVksQ0FBQyxPQUFPLEVBQUU7NENBQzFDLE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxHQUFHLGFBQWEsQ0FBQzs0Q0FDdEQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUU7Z0RBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0RBQ1gsSUFBSSxFQUFFLFVBQVU7b0RBQ2hCLFlBQVksRUFBRSxhQUFhO29EQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0RBQ3ZCLGVBQWUsRUFBRSxnQkFBZ0IsR0FBRyxDQUFDO2lEQUNyQyxDQUFDLENBQUM7NkNBQ0g7eUNBQ0Q7cUNBQ0Q7aUNBQ0Q7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7b0JBRUQsSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7d0JBQzlCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDekQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDdkMsTUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUM5RCxJQUFJLENBQUMsYUFBYSxFQUFFO2dDQUNuQixTQUFTOzZCQUNUOzRCQUVELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO2dDQUN6QyxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtvQ0FDeEMsU0FBUztpQ0FDVDtnQ0FFRCxNQUFNLENBQUMsSUFBSSxDQUFDO29DQUNYLElBQUksRUFBRSxVQUFVO29DQUNoQixZQUFZLEVBQUUsWUFBWTtvQ0FDMUIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2lDQUN2QixDQUFDLENBQUM7NkJBQ0g7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFdEIsS0FBSyxNQUFNLFlBQVksSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLHdCQUFZLENBQUMsRUFBRTtvQkFDdEQsSUFBSSxZQUFZLEtBQUssd0JBQVksQ0FBQyxLQUFLLEVBQUU7d0JBQ3hDLE1BQU0saUJBQWlCLEdBQUcsaUJBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7NEJBQ3BELEtBQUssTUFBTSxRQUFRLElBQUksaUJBQWlCLENBQUMsUUFBUSxFQUFFO2dDQUNsRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtvQ0FDcEMsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQ0FDdEMsSUFBSSxDQUFDLFNBQVMsRUFBRTt3Q0FDZixTQUFTLEdBQUcsRUFBRSxDQUFDO3dDQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO3FDQUNqQztvQ0FFRCxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQ0FDOUI7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsTUFBTSxHQUFHO29CQUNSLFVBQVUsRUFBRSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ25DLEdBQUcsRUFBRSxHQUFHO2lCQUNSLENBQUM7Z0JBRUYsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzNEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pFLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFFWixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLFdBQVcsR0FBRyx3QkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRTt3QkFDekMsS0FBSyxNQUFNLEVBQUUsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTs0QkFDN0MsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0NBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ2hCLE1BQU07NkJBQ047eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzVEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQS9ORiw4QkFpT0M7SUEvTndCLDhCQUFrQixHQUFvQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2hFLDZCQUFpQixHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzdELCtCQUFtQixHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQy9ELGdDQUFvQixHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDIn0=
define(["require", "exports", "doodad/Doodads", "doodad/IDoodad", "entity/creature/corpse/Corpses", "entity/creature/ICreature", "item/IItem", "item/Items", "tile/ITerrain", "tile/TerrainResources", "utilities/enum/Enums", "../../../Objective", "../../Gather/GatherFromChest", "../../Gather/GatherFromCorpse", "../../Gather/GatherFromCreature", "../../Gather/GatherFromDoodad", "../../Gather/GatherFromGround", "../../Gather/GatherFromTerrain", "./AcquireItemFromDismantle", "./AcquireItemWithRecipe"], function (require, exports, Doodads_1, IDoodad_1, Corpses_1, ICreature_1, IItem_1, Items_1, ITerrain_1, TerrainResources_1, Enums_1, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1, AcquireItemFromDismantle_1, AcquireItemWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItem extends Objective_1.default {
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
        sort(executionTreeA, executionTreeB) {
            const gatherObjectiveCountA = this.countGatherObjectives(executionTreeA);
            const gatherObjectiveCountB = this.countGatherObjectives(executionTreeB);
            return gatherObjectiveCountA === gatherObjectiveCountB ? 0 : gatherObjectiveCountA < gatherObjectiveCountB ? 1 : -1;
        }
        async execute() {
            this.log.info(`Acquiring ${IItem_1.ItemType[this.itemType]}...`);
            const itemDescription = Items_1.itemDescriptions[this.itemType];
            const objectivePipelines = [
                [new GatherFromGround_1.default(this.itemType)],
                [new GatherFromChest_1.default(this.itemType)],
            ];
            const terrainSearch = this.getTerrainSearch();
            if (terrainSearch.length > 0) {
                objectivePipelines.push([new GatherFromTerrain_1.default(terrainSearch)]);
            }
            const doodadSearch = this.getDoodadSearch();
            if (doodadSearch.length > 0) {
                objectivePipelines.push([new GatherFromDoodad_1.default(doodadSearch)]);
            }
            const creatureSearch = this.getCreatureSearch();
            if (creatureSearch.map.size > 0) {
                objectivePipelines.push([new GatherFromCorpse_1.default(creatureSearch)]);
                objectivePipelines.push([new GatherFromCreature_1.default(creatureSearch)]);
            }
            const dismantleSearch = this.getDismantleSearch();
            if (dismantleSearch.length > 0) {
                objectivePipelines.push([new AcquireItemFromDismantle_1.default(this.itemType, dismantleSearch)]);
            }
            if (itemDescription && itemDescription.recipe) {
                objectivePipelines.push([new AcquireItemWithRecipe_1.default(this.itemType, itemDescription.recipe)]);
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
                for (const doodadType of Enums_1.default.values(IDoodad_1.DoodadType)) {
                    const doodadDescription = Doodads_1.default[doodadType];
                    if (doodadDescription) {
                        if (doodadDescription.gather && doodadType !== IDoodad_1.DoodadType.AppleTree) {
                            for (const key of Object.keys(doodadDescription.gather)) {
                                const growingStage = parseInt(key, 10);
                                if ((doodadDescription.isTall && growingStage >= IDoodad_1.GrowingStage.Budding) || growingStage >= IDoodad_1.GrowingStage.Ripening) {
                                    const resourceItems = doodadDescription.gather[growingStage];
                                    if (resourceItems) {
                                        for (const resourceItem of resourceItems) {
                                            if (resourceItem.type === this.itemType) {
                                                search.push({
                                                    type: doodadType,
                                                    growingStage: growingStage,
                                                    itemType: this.itemType,
                                                });
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
                                if (resourceItems) {
                                    for (const resourceItem of resourceItems) {
                                        if (resourceItem.type === this.itemType) {
                                            search.push({
                                                type: doodadType,
                                                growingStage: growingStage,
                                                itemType: this.itemType,
                                            });
                                        }
                                    }
                                }
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
        countGatherObjectives(executionTree) {
            const walkTree = (tree) => {
                let count = 0;
                if (tree.objective.getName().startsWith("AcquireItem")) {
                    if (tree.children.length === 0) {
                        return -1;
                    }
                    count += tree.children.reduce((count, tree) => {
                        let nextCount = count;
                        if (tree.objective instanceof GatherFromCreature_1.default) {
                            nextCount += 5;
                        }
                        else if (tree.objective instanceof GatherFromCorpse_1.default) {
                            nextCount += 4;
                        }
                        else if (tree.objective instanceof GatherFromTerrain_1.default) {
                            nextCount += 3;
                        }
                        else if (tree.objective instanceof GatherFromDoodad_1.default) {
                            nextCount += 3;
                        }
                        else if (tree.objective instanceof GatherFromGround_1.default) {
                            nextCount += 1;
                        }
                        return nextCount;
                    }, 0);
                }
                for (const child of tree.children) {
                    const childCount = walkTree(child);
                    if (childCount === -1) {
                        return -1;
                    }
                    count += childCount;
                }
                return count;
            };
            const count = walkTree(executionTree);
            if (count === -1) {
                return 0;
            }
            return count;
        }
    }
    exports.default = AcquireItem;
    AcquireItem.terrainSearchCache = new Map();
    AcquireItem.doodadSearchCache = new Map();
    AcquireItem.creatureSearchCache = new Map();
    AcquireItem.dismantleSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQVFqRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZUFBZSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFFbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBT00sSUFBSSxDQUFDLGNBQTJDLEVBQUUsY0FBMkM7WUFDbkcsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDekUsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFekUsT0FBTyxxQkFBcUIsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU87WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxlQUFlLEdBQUcsd0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhELE1BQU0s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
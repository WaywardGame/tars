define(["require", "exports", "game/item/IItem", "game/item/ItemManager", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, ItemManager_1, ITerrain_1, Terrains_1, Dictionary_1, Translation_1, Objective_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrainResource extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
            this.gatherObjectivePriority = 200;
        }
        getIdentifier() {
            return `GatherFromTerrainResource:${this.search.map(search => `${ITerrain_1.TerrainType[search.type]}:${ItemManager_1.default.isGroup(search.itemType) ? IItem_1.ItemTypeGroup[search.itemType] : IItem_1.ItemType[search.itemType]}`).join(",")}`;
        }
        getStatus() {
            return "Gathering items from terrain";
        }
        canGroupTogether() {
            return true;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const objectivePipelines = [];
            const tool = context.inventory.shovel;
            for (const terrainSearch of this.search) {
                const terrainDescription = Terrains_1.default[terrainSearch.type];
                if (!terrainDescription) {
                    continue;
                }
                const tileLocations = await context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
                for (const tileLocation of tileLocations) {
                    if (!context.utilities.tile.canGather(context, tileLocation.tile)) {
                        continue;
                    }
                    let step = 0;
                    const point = tileLocation.point;
                    const tileData = context.island.getTileData(point.x, point.y, point.z);
                    if (tileData && tileData.length > 0) {
                        const tileDataStep = tileData[0].step;
                        if (tileDataStep !== undefined) {
                            step = tileDataStep;
                        }
                    }
                    let difficulty = 0;
                    let matches = 0;
                    const resources = context.island.getTerrainItems(terrainSearch?.resource);
                    if (resources) {
                        const nextLootItems = resources.slice(step);
                        for (let i = 0; i < nextLootItems.length; i++) {
                            const loot = nextLootItems[i];
                            let chanceForHit = 0;
                            if (loot.type === terrainSearch.itemType) {
                                matches++;
                                if (loot.chance === undefined) {
                                    difficulty = i * 2;
                                    break;
                                }
                                chanceForHit = loot.chance / 100;
                                difficulty += 60 * (1 - chanceForHit);
                            }
                            else {
                                difficulty += 5;
                            }
                        }
                    }
                    if (matches === 0) {
                        if (step === 0) {
                            this.log.error("GatherFromTerrain no matches", step, IItem_1.ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
                        }
                        continue;
                    }
                    if (!terrainDescription.gather && !tool) {
                        difficulty += 500;
                    }
                    if (terrainSearch.extraDifficulty !== undefined) {
                        difficulty += terrainSearch.extraDifficulty;
                    }
                    difficulty = Math.round(difficulty);
                    objectivePipelines.push([
                        new AddDifficulty_1.default(difficulty),
                        new MoveToTarget_1.default(point, true),
                        new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType))
                            .passAcquireData(this)
                            .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, terrainSearch.itemType).getString()} from ${Translation_1.default.nameOf(Dictionary_1.default.Terrain, terrainSearch.type).getString()}`),
                    ]);
                }
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 10;
        }
    }
    exports.default = GatherFromTerrainResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5SZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpblJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHlCQUEwQixTQUFRLG1CQUFTO1FBSS9ELFlBQTZCLE1BQWdDO1lBQzVELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQTBCO1lBRjdDLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUk5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9NLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLFNBQVM7WUFLeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFFdEMsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dC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
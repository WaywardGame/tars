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
            for (const terrainSearch of this.search) {
                const tileLocations = await context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);
                for (const tileLocation of tileLocations) {
                    this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation);
                }
                if (objectivePipelines.length === 0 && tileLocations.length === 5) {
                    for (const tileLocation of tileLocations) {
                        this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation, true);
                    }
                }
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 10;
        }
        processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation, skipSmartCheck) {
            const terrainDescription = Terrains_1.default[terrainSearch.type];
            if (!terrainDescription) {
                return;
            }
            if (!context.utilities.tile.canGather(context, tileLocation.tile)) {
                return;
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
                if (skipSmartCheck) {
                    difficulty += 50000;
                }
                else {
                    if (step === 0) {
                        this.log.error("GatherFromTerrain no matches", step, IItem_1.ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
                    }
                    return;
                }
            }
            if (!terrainDescription.gather && !context.inventory.shovel) {
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
    exports.default = GatherFromTerrainResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5SZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpblJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHlCQUEwQixTQUFRLG1CQUFTO1FBSS9ELFlBQTZCLE1BQWdDO1lBQzVELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQTBCO1lBRjdDLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUk5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9NLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLFNBQVM7WUFLeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QyxNQUFNLGFBQWEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxD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
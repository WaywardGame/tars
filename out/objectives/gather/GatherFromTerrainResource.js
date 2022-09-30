define(["require", "exports", "game/item/IItem", "game/item/ItemManager", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, ItemManager_1, ITerrain_1, Terrains_1, Dictionary_1, Translation_1, Objective_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrainResource extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
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
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType), { expectedTerrainType: terrainSearch.type })
                    .passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, terrainSearch.itemType).getString()} from ${Translation_1.default.nameOf(Dictionary_1.default.Terrain, terrainSearch.type).getString()}`),
            ]);
        }
    }
    exports.default = GatherFromTerrainResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW5SZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tVGVycmFpblJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLHlCQUEwQixTQUFRLG1CQUFTO1FBRS9ELFlBQTZCLE1BQWdDO1lBQzVELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQTBCO1FBRTdELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNkJBQTZCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDL00sQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDhCQUE4QixDQUFDO1FBQ3ZDLENBQUM7UUFFZSxnQkFBZ0I7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsU0FBUztZQUt4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hDLE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGFB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
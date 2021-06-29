define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "game/tile/Terrains", "../../Objective", "../../utilities/Item", "../../utilities/Tile", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IAction_1, IItem_1, ITerrain_1, Terrains_1, Objective_1, Item_1, Tile_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrain extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getIdentifier() {
            return `GatherFromTerrain:${this.search.map(search => `${ITerrain_1.TerrainType[search.type]}:${itemManager.isGroup(search.itemType) ? IItem_1.ItemTypeGroup[search.itemType] : IItem_1.ItemType[search.itemType]}`).join(",")}`;
        }
        getStatus() {
            return "Gathering items from terrain";
        }
        canGroupTogether() {
            return true;
        }
        async execute(context) {
            const objectivePipelines = [];
            const hasDigTool = Item_1.itemUtilities.hasInventoryItemForAction(context, IAction_1.ActionType.Dig);
            for (const terrainSearch of this.search) {
                const terrainDescription = Terrains_1.default[terrainSearch.type];
                if (!terrainDescription) {
                    continue;
                }
                const tileLocations = await Tile_1.tileUtilities.getNearestTileLocation(context, terrainSearch.type);
                for (const tileLocation of tileLocations) {
                    if (!Tile_1.tileUtilities.canGather(tileLocation.tile)) {
                        continue;
                    }
                    let step = 0;
                    const point = tileLocation.point;
                    const tileData = game.getTileData(point.x, point.y, point.z);
                    if (tileData && tileData.length > 0) {
                        const tileDataStep = tileData[0].step;
                        if (tileDataStep !== undefined) {
                            step = tileDataStep;
                        }
                    }
                    let difficulty = 0;
                    let matches = 0;
                    const nextLootItems = terrainSearch.resource.items.slice(step);
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
                    if (matches === 0) {
                        if (step === 0) {
                            console.error("GatherFromTerrain no matches", step, IItem_1.ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
                        }
                        continue;
                    }
                    if (!terrainDescription.gather && !hasDigTool) {
                        difficulty += 500;
                    }
                    if (terrainSearch.extraDifficulty !== undefined) {
                        difficulty += terrainSearch.extraDifficulty;
                    }
                    difficulty = Math.round(difficulty);
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(difficulty));
                    objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType)).passAcquireData(this));
                    objectivePipelines.push(objectives);
                }
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 10;
        }
    }
    exports.default = GatherFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyRnJvbVRlcnJhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY0EsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBd0I7WUFDcEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7UUFFckQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZNLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sVUFBVSxHQUFHLG9CQUFhLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFcEYsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFD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
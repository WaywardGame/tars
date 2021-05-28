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
        canGroupTogether() {
            return true;
        }
        async execute(context) {
            const objectivePipelines = [];
            const hasDigTool = Item_1.getBestActionItem(context, IAction_1.ActionType.Dig) !== undefined;
            for (const terrainSearch of this.search) {
                const terrainDescription = Terrains_1.default[terrainSearch.type];
                if (!terrainDescription) {
                    continue;
                }
                const tileLocations = await Tile_1.getNearestTileLocation(context, terrainSearch.type);
                for (const tileLocation of tileLocations) {
                    if (!Tile_1.canGather(tileLocation.tile)) {
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
                    difficulty = Math.round(difficulty);
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(difficulty));
                    objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType)).passContextDataKey(this));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyRnJvbVRlcnJhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY0EsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBd0I7WUFDcEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7UUFFckQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZNLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxVQUFVLEdBQUcsd0JBQWlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxDQUFDO1lBRTVFLEtBQUssTUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUN4QixTQUFTO2lC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
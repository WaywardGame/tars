define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionary", "language/Translation", "../../Objective", "../../utilities/Item", "../../utilities/Tile", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IAction_1, IItem_1, ITerrain_1, Terrains_1, Dictionary_1, Translation_1, Objective_1, Item_1, Tile_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrain extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
            this.gatherObjectivePriority = 200;
        }
        getIdentifier() {
            return `GatherFromTerrain:${this.search.map(search => `${ITerrain_1.TerrainType[search.type]}:${localIsland.items.isGroup(search.itemType) ? IItem_1.ItemTypeGroup[search.itemType] : IItem_1.ItemType[search.itemType]}`).join(",")}`;
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
                    if (!Tile_1.tileUtilities.canGather(context, tileLocation.tile)) {
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
                    objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType))
                        .passAcquireData(this)
                        .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, terrainSearch.itemType).getString()} from ${Translation_1.default.nameOf(Dictionary_1.default.Terrain, terrainSearch.type).getString()}`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyRnJvbVRlcnJhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLGlCQUFrQixTQUFRLG1CQUFTO1FBSXZELFlBQTZCLE1BQXdCO1lBQ3BELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQWtCO1lBRnJDLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUk5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHFCQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdNLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sVUFBVSxHQUFHLG9CQUFhLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFcEYsS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QyxNQUFNLGtCQUFrQixH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
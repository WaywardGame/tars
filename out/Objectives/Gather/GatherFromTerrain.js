define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionaries", "language/Translation", "../../Objective", "../../utilities/Item", "../../utilities/Tile", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IAction_1, IItem_1, ITerrain_1, Terrains_1, Dictionaries_1, Translation_1, Objective_1, Item_1, Tile_1, ExecuteActionForItem_1, MoveToTarget_1) {
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
                    objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Terrain, this.search.map(search => search.itemType))
                        .passAcquireData(this)
                        .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, terrainSearch.itemType).getString()} from ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Terrain, terrainSearch.type).getString()}`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyRnJvbVRlcnJhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLGlCQUFrQixTQUFRLG1CQUFTO1FBRXZELFlBQTZCLE1BQXdCO1lBQ3BELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBRXJELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8scUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2TSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLFVBQVUsR0FBRyxvQkFBYSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXBGLEtBQUssTUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFO29CQUN4QixTQUFTO2lCQUNUO2dCQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sb0JBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU5RixLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtvQkFDekMsSUFBSSxDQUFDLG9CQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDaEQsU0FBUztxQkFDVDtvQkFFRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7b0JBRWIsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztvQkFDakMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3RCxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDcEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDdEMsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFOzRCQUMvQixJQUFJLEdBQUcsWUFBWSxDQUFDO3lCQUNwQjtxQkFDRDtvQkFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7b0JBQ25CLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztvQkFFaEIsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDOUMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUU5QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7d0JBRXJCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsUUFBUSxFQUFFOzRCQUN6QyxPQUFPLEVBQUUsQ0FBQzs0QkFFVixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dDQUU5QixVQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDbkIsTUFBTTs2QkFDTjs0QkFFRCxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7NEJBRWpDLFVBQVUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUM7eUJBRXRDOzZCQUFNOzRCQUNOLFVBQVUsSUFBSSxDQUFDLENBQUM7eUJBQ2hCO3FCQUNEO29CQUVELElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTt3QkFDbEIsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFOzRCQUVmLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsSUFBSSxFQUFFLGdCQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7eUJBQ2pJO3dCQUVELFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRTt3QkFDOUMsVUFBVSxJQUFJLEdBQUcsQ0FBQztxQkFDbEI7b0JBRUQsSUFBSSxhQUFhLENBQUMsZUFBZSxLQUFLLFNBQVMsRUFBRTt3QkFDaEQsVUFBVSxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUM7cUJBQzVDO29CQUVELFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUVwQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBRXpFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQzdHLGVBQWUsQ0FBQyxJQUFJLENBQUM7eUJBQ3JCLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBRTFMLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDcEM7YUFDRDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVTLGlCQUFpQixDQUFDLE9BQWdCO1lBQzNDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUVEO0lBaEhELG9DQWdIQyJ9
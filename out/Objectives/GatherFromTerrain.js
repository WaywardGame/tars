var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "tile/Terrains", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Item", "../Utilities/Movement", "../Utilities/Tile"], function (require, exports, Enums_1, Terrains_1, Vector2_1, IObjective_1, Objective_1, Item_1, Movement_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrain extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromTerrain:${this.search.map(search => `${Enums_1.TerrainType[search.type]},${itemManager.getItemTypeGroupName(search.itemType, false)},${search.chance}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const digTool = Item_1.getBestActionItem(Enums_1.ActionType.Dig);
                let terrainDescription;
                let targets = [];
                for (const ts of this.search) {
                    terrainDescription = Terrains_1.default[ts.type];
                    if (!terrainDescription) {
                        continue;
                    }
                    const tileLocations = yield Tile_1.getNearestTileLocation(ts.type, localPlayer);
                    if (tileLocations.length > 0) {
                        for (let i = 0; i < 5; i++) {
                            const tileLocation = tileLocations[i];
                            if (tileLocation) {
                                const point = tileLocation.point;
                                if (!terrainDescription.gather && (tileLocation.tile.doodad || tileLocation.tile.containedItems)) {
                                    continue;
                                }
                                let difficulty = Math.round(Vector2_1.default.squaredDistance(localPlayer, point)) + (100 - ts.chance);
                                if (!terrainDescription.gather && !digTool) {
                                    difficulty += 100;
                                }
                                targets.push({
                                    search: ts,
                                    point: point,
                                    difficulty: difficulty
                                });
                            }
                        }
                    }
                }
                if (targets.length === 0) {
                    if (calculateDifficulty) {
                        return IObjective_1.missionImpossible;
                    }
                    this.log.info("No terrain targets to gather from");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                targets = targets.sort((a, b) => a.difficulty > b.difficulty ? 1 : -1);
                if (calculateDifficulty) {
                    return targets[0].difficulty;
                }
                let selectedTarget;
                const facingTile = localPlayer.getFacingTile();
                for (let i = 0; i < 8; i++) {
                    const target = targets[i];
                    if (target) {
                        const targetTile = game.getTileFromPoint(target.point);
                        if (targetTile === facingTile) {
                            terrainDescription = Terrains_1.default[target.search.type];
                            if (!terrainDescription.gather && (targetTile.doodad || targetTile.containedItems)) {
                                continue;
                            }
                            selectedTarget = target;
                            break;
                        }
                    }
                }
                if (!selectedTarget) {
                    const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                        for (let i = 0; i < targets.length; i++) {
                            const target = targets[i];
                            if (target) {
                                const targetTile = game.getTileFromPoint(target.point);
                                terrainDescription = Terrains_1.default[target.search.type];
                                if (!terrainDescription.gather && (targetTile.doodad || targetTile.containedItems)) {
                                    continue;
                                }
                                if (ignoredTiles.indexOf(targetTile) === -1) {
                                    selectedTarget = target;
                                    return target.point;
                                }
                            }
                        }
                        return undefined;
                    });
                    if (moveResult === Movement_1.MoveResult.NoTarget) {
                        this.log.info("Can't find terrain tile nearby");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else if (moveResult !== Movement_1.MoveResult.Complete) {
                        return;
                    }
                }
                terrainDescription = Terrains_1.default[selectedTarget.search.type];
                const actionType = terrainDescription.gather ? Enums_1.ActionType.Gather : Enums_1.ActionType.Dig;
                const item = terrainDescription.gather ? Item_1.getBestActionItem(Enums_1.ActionType.Gather, Enums_1.DamageType.Blunt) : digTool;
                return this.executeActionForItem(actionType, { item: item }, this.search.map(search => search.itemType));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 10;
        }
    }
    exports.default = GatherFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJGcm9tVGVycmFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQW1CQSx1QkFBdUMsU0FBUSxtQkFBUztRQUV2RCxZQUFvQixNQUF3QjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURXLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBRTVDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8scUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvSyxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sT0FBTyxHQUFHLHdCQUFpQixDQUFDLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRWxELElBQUksa0JBQW1ELENBQUM7Z0JBRXhELElBQUksT0FBTyxHQUEyQixFQUFFLENBQUM7Z0JBRXpDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDN0Isa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTt3QkFDeEIsU0FBUztxQkFDVDtvQkFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLDZCQUFzQixDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ3pFLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQzNCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEMsSUFBSSxZQUFZLEVBQUU7Z0NBQ2pCLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7Z0NBRWpDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSyxZQUFZLENBQUMsSUFBbUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtvQ0FDakgsU0FBUztpQ0FDVDtnQ0FFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDN0YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRTtvQ0FDM0MsVUFBVSxJQUFJLEdBQUcsQ0FBQztpQ0FDbEI7Z0NBRUQsT0FBTyxDQUFDLElBQUksQ0FBQztvQ0FDWixNQUFNLEVBQUUsRUFBRTtvQ0FDVixLQUFLLEVBQUUsS0FBSztvQ0FDWixVQUFVLEVBQUUsVUFBVTtpQ0FDdEIsQ0FBQyxDQUFDOzZCQUNIO3lCQUNEO3FCQUVEO2lCQUNEO2dCQUVELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3pCLElBQUksbUJBQW1CLEVBQUU7d0JBQ3hCLE9BQU8sOEJBQWlCLENBQUM7cUJBQ3pCO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7b0JBQ25ELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBSXZFLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztpQkFDN0I7Z0JBRUQsSUFBSSxjQUFnRCxDQUFDO2dCQUVyRCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBRS9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzNCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkQsSUFBSSxVQUFVLEtBQUssVUFBVSxFQUFFOzRCQUM5QixrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUM7NEJBQ25ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFLLFVBQXlCLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0NBQ25HLFNBQVM7NkJBQ1Q7NEJBRUQsY0FBYyxHQUFHLE1BQU0sQ0FBQzs0QkFDeEIsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLENBQUMsY0FBYyxFQUFFO29CQUVwQixNQUFNLFVBQVUsR0FBRyxNQUFNLHNDQUEyQixDQUFDLENBQUMsWUFBcUIsRUFBRSxFQUFFO3dCQUM5RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQixJQUFJLE1BQU0sRUFBRTtnQ0FDWCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUV2RCxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUM7Z0NBQ25ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFLLFVBQXlCLENBQUMsY0FBYyxDQUFDLEVBQUU7b0NBQ25HLFNBQVM7aUNBQ1Q7Z0NBRUQsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29DQUM1QyxjQUFjLEdBQUcsTUFBTSxDQUFDO29DQUN4QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7aUNBQ3BCOzZCQUNEO3lCQUNEO3dCQUVELE9BQU8sU0FBUyxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzt3QkFDaEQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztxQkFFaEM7eUJBQU0sSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQzlDLE9BQU87cUJBQ1A7aUJBQ0Q7Z0JBRUQsa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxjQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUU1RCxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDbEYsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBaUIsQ0FBQyxrQkFBVSxDQUFDLE1BQU0sRUFBRSxrQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBRTFHLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzFHLENBQUM7U0FBQTtRQUVTLGlCQUFpQixDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUNsRSxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FFRDtJQW5JRCxvQ0FtSUMifQ==
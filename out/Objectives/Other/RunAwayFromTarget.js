define(["require", "exports", "game/entity/IStats", "game/tile/Terrains", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/entity/Entity", "../../navigation/Navigation", "../../Objective", "../../utilities/Movement", "../core/MoveToTarget"], function (require, exports, IStats_1, Terrains_1, TileHelpers_1, Vector2_1, Entity_1, Navigation_1, Objective_1, Movement_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const safetyCheckDistance = 5;
    const safetyCheckDistanceSq = Math.pow(safetyCheckDistance, 2);
    class RunAwayFromTarget extends Objective_1.default {
        constructor(target, maxRunAwayDistance = 20) {
            super();
            this.target = target;
            this.maxRunAwayDistance = maxRunAwayDistance;
        }
        getIdentifier() {
            return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z})`;
        }
        getStatus() {
            return `Running away from ${this.target instanceof Entity_1.default ? this.target.getName() : `(${this.target.x},${this.target.y},${this.target.z})`}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            var _a;
            const nearbyTilesDistance = this.maxRunAwayDistance;
            const nearbyTilesDistanceSq = Math.pow(nearbyTilesDistance, 2);
            const navigation = Navigation_1.default.get();
            const nearbyOpenTiles = TileHelpers_1.default.findMatchingTiles(context.player, (point, tile) => {
                const terrainType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[terrainType];
                if (terrainDescription &&
                    ((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.player.stat.get(IStats_1.Stat.Stamina).value <= 1))) {
                    return false;
                }
                if (navigation.isDisabledFromPoint(point)) {
                    return false;
                }
                return true;
            }, {
                canVisitTile: (nextPoint) => Vector2_1.default.squaredDistance(context.player, nextPoint) <= nearbyTilesDistanceSq,
            });
            const pointsWithSafety = [];
            const scoreCache = new Map();
            for (const nearbyOpenTile of nearbyOpenTiles) {
                const movementPath = await Movement_1.movementUtilities.getMovementPath(context, nearbyOpenTile.point, false);
                if (!movementPath.path) {
                    continue;
                }
                let score = 0;
                const distance = Vector2_1.default.squaredDistance(context.player, nearbyOpenTile.point);
                score -= distance * 200;
                for (const point of movementPath.path) {
                    const index = `${point.x},${point.y}`;
                    let pointScore = scoreCache.get(index);
                    if (pointScore === undefined) {
                        pointScore = 0;
                        const pointZ = { ...point, z: context.player.z };
                        pointScore += navigation.getPenaltyFromPoint(pointZ) * 10;
                        const tile = game.getTileFromPoint(pointZ);
                        if ((_a = tile.doodad) === null || _a === void 0 ? void 0 : _a.blocksMove()) {
                            pointScore += 2000;
                        }
                        const terrainType = TileHelpers_1.default.getType(tile);
                        const terrainDescription = Terrains_1.default[terrainType];
                        if (terrainDescription) {
                            if (!terrainDescription.passable && !terrainDescription.water) {
                                pointScore += 2000;
                            }
                        }
                        TileHelpers_1.default.findMatchingTiles(pointZ, (point, tile) => {
                            pointScore += navigation.getPenaltyFromPoint(point, tile);
                            return true;
                        }, {
                            canVisitTile: (nextPoint) => Vector2_1.default.squaredDistance(point, nextPoint) <= safetyCheckDistanceSq,
                        });
                        scoreCache.set(index, pointScore);
                    }
                    score += pointScore;
                }
                pointsWithSafety.push([nearbyOpenTile.point, score]);
            }
            pointsWithSafety.sort((a, b) => a[1] - b[1]);
            const objectives = [];
            const bestPoint = pointsWithSafety.length > 0 ? pointsWithSafety[0] : undefined;
            if (bestPoint) {
                if (context.calculatingDifficulty) {
                    return 0;
                }
                objectives.push(new MoveToTarget_1.default(bestPoint[0], false, { disableStaminaCheck: true }).setStatus(this));
            }
            else {
                this.log.info("Unable to run away from target");
            }
            return objectives;
        }
    }
    exports.default = RunAwayFromTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBeUIsRUFBbUIscUJBQXFCLEVBQUU7WUFDL0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFLO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDakYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHFCQUFxQixJQUFJLENBQUMsTUFBTSxZQUFZLGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzlJLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDcEQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRS9ELE1BQU0sVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFHcEMsTUFBTSxlQUFlLEdBQUcscUJBQVcsQ0FBQyxpQkFBaUIsQ0FDcEQsT0FBTyxDQUFDLE1BQU0sRUFDZCxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDZixNQUFNLFdBQVcsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxrQkFBa0IsR0FBRyxrQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxrQkFBa0I7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2xKLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMxQyxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsRUFDRDtnQkFDQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUkscUJBQXFCO2FBQ3hHLENBQ0QsQ0FBQztZQUdGLE1BQU0sZ0JBQWdCLEdBQThCLEVBQUUsQ0FBQztZQUV2RCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUU3QyxLQUFLLE1BQU0sY0FBYyxJQUFJLGVBQWUsRUFBRTtnQkFDN0MsTUFBTSxZQUFZLEdBQUcsTUFBTSw0QkFBaUIsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO29CQUN2QixTQUFTO2lCQUNUO2dCQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFHZCxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0UsS0FBSyxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUM7Z0JBRXhCLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxDQUFDLElBQUksRUFBRTtvQkFDdEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFFdEMsSUFBSSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO3dCQUM3QixVQUFVLEdBQUcsQ0FBQyxDQUFDO3dCQUVmLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBRWpELFVBQVUsSUFBSSxVQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO3dCQUcxRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzNDLElBQUksTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxVQUFVLEVBQUUsRUFBRTs0QkFDOUIsVUFBVyxJQUFJLElBQUksQ0FBQzt5QkFDcEI7d0JBRUQsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzlDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQzVELElBQUksa0JBQWtCLEVBQUU7NEJBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7Z0NBQzlELFVBQVcsSUFBSSxJQUFJLENBQUM7NkJBQ3BCO3lCQUNEO3dCQUdELHFCQUFXLENBQUMsaUJBQWlCLENBQzVCLE1BQU0sRUFDTixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTs0QkFDZixVQUFXLElBQUksVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkF5QjNELE9BQU8sSUFBSSxDQUFDO3dCQUNiLENBQUMsRUFDRDs0QkFDQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxxQkFBcUI7eUJBQy9GLENBQ0QsQ0FBQzt3QkFFRixVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztxQkFDbEM7b0JBRUQsS0FBSyxJQUFJLFVBQVUsQ0FBQztpQkFDcEI7Z0JBRUQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBSTdDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUVoRixJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtvQkFFbEMsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFdEc7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQTNKRCxvQ0EySkMifQ==
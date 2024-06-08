/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/IStats", "@wayward/game/utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget"], function (require, exports, IStats_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const safetyCheckDistance = 5;
    const safetyCheckDistanceSq = Math.pow(safetyCheckDistance, 2);
    class RunAwayFromTarget extends Objective_1.default {
        constructor(target, maxRunAwayDistance = 30) {
            super();
            this.target = target;
            this.maxRunAwayDistance = maxRunAwayDistance;
        }
        getIdentifier() {
            return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.maxRunAwayDistance}`;
        }
        getStatus() {
            return `Running away from ${this.target.getName()}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const nearbyTilesDistance = this.maxRunAwayDistance;
            const nearbyTilesDistanceSq = Math.pow(nearbyTilesDistance, 2);
            const navigation = context.utilities.navigation;
            const nearbyOpenTiles = context.human.tile.findMatchingTiles((tile) => {
                const terrainDescription = tile.description;
                if (terrainDescription &&
                    ((!terrainDescription.passable && !terrainDescription.water) || tile.isDeepHole || (terrainDescription.water && context.human.stat.get(IStats_1.Stat.Stamina).value <= 1))) {
                    return false;
                }
                if (navigation.isDisabled(tile)) {
                    return false;
                }
                return true;
            }, {
                canVisitTile: (nextTile) => Vector2_1.default.squaredDistance(context.human, nextTile) <= nearbyTilesDistanceSq,
            });
            const tilesWithSafety = [];
            const scoreCache = new Map();
            for (const nearbyOpenTile of nearbyOpenTiles) {
                const movementPath = await context.utilities.movement.getMovementPath(context, nearbyOpenTile, false);
                if (movementPath === IObjective_1.ObjectiveResult.Complete || movementPath === IObjective_1.ObjectiveResult.Impossible) {
                    continue;
                }
                let score = 0;
                const distance = Vector2_1.default.squaredDistance(context.human, nearbyOpenTile);
                score -= distance * 200;
                for (const point of movementPath.path) {
                    const index = `${point.x},${point.y} `;
                    let pointScore = scoreCache.get(index);
                    if (pointScore === undefined) {
                        pointScore = 0;
                        const tile = context.island.getTileFromPoint({ ...point, z: context.human.z });
                        pointScore += navigation.getPenalty(tile) * 10;
                        if (tile.doodad?.blocksMove || tile.isDeepHole) {
                            pointScore += 2000;
                        }
                        const terrainDescription = tile.description;
                        if (terrainDescription) {
                            if (!terrainDescription.passable && !terrainDescription.water) {
                                pointScore += 2000;
                            }
                        }
                        tile.findMatchingTiles((tile) => {
                            pointScore += navigation.getPenalty(tile);
                            return true;
                        }, {
                            canVisitTile: (nextTile) => Vector2_1.default.squaredDistance(point, nextTile) <= safetyCheckDistanceSq,
                        });
                        scoreCache.set(index, pointScore);
                    }
                    score += pointScore;
                }
                tilesWithSafety.push([nearbyOpenTile, score]);
            }
            tilesWithSafety.sort((a, b) => a[1] - b[1]);
            const objectives = [];
            const bestTile = tilesWithSafety.length > 0 ? tilesWithSafety[0] : undefined;
            if (bestTile) {
                if (context.calculatingDifficulty) {
                    return 0;
                }
                objectives.push(new MoveToTarget_1.default(bestTile[0], false, { disableStaminaCheck: true }).setStatus(this));
            }
            else {
                this.log.info("Unable to run away from target");
            }
            return objectives;
        }
    }
    exports.default = RunAwayFromTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFVSCxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBYyxFQUFtQixxQkFBcUIsRUFBRTtZQUNwRixLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQW1CLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBSztRQUVyRixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHNCQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM1RyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQ3BELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUdoRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FDM0QsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDUixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQzVDLElBQUksa0JBQWtCO29CQUNyQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDckssT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDakMsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsRUFDRDtnQkFDQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUkscUJBQXFCO2FBQ3JHLENBQ0QsQ0FBQztZQUdGLE1BQU0sZUFBZSxHQUEwQixFQUFFLENBQUM7WUFFbEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFFN0MsS0FBSyxNQUFNLGNBQWMsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDOUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxZQUFZLEtBQUssNEJBQWUsQ0FBQyxRQUFRLElBQUksWUFBWSxLQUFLLDRCQUFlLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzlGLFNBQVM7Z0JBQ1YsQ0FBQztnQkFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBR2QsTUFBTSxRQUFRLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDeEUsS0FBSyxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUM7Z0JBRXhCLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN2QyxNQUFNLEtBQUssR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUV2QyxJQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN2QyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDOUIsVUFBVSxHQUFHLENBQUMsQ0FBQzt3QkFFZixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFL0UsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO3dCQUcvQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs0QkFDaEQsVUFBVSxJQUFJLElBQUksQ0FBQzt3QkFDcEIsQ0FBQzt3QkFFRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7d0JBQzVDLElBQUksa0JBQWtCLEVBQUUsQ0FBQzs0QkFDeEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO2dDQUMvRCxVQUFVLElBQUksSUFBSSxDQUFDOzRCQUNwQixDQUFDO3dCQUNGLENBQUM7d0JBR0QsSUFBSSxDQUFDLGlCQUFpQixDQUNyQixDQUFDLElBQUksRUFBRSxFQUFFOzRCQUNSLFVBQVcsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQXlCM0MsT0FBTyxJQUFJLENBQUM7d0JBQ2IsQ0FBQyxFQUNEOzRCQUNDLFlBQVksRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLHFCQUFxQjt5QkFDN0YsQ0FDRCxDQUFDO3dCQUVGLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNuQyxDQUFDO29CQUVELEtBQUssSUFBSSxVQUFVLENBQUM7Z0JBQ3JCLENBQUM7Z0JBRUQsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFFRCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBSTVDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRTdFLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFFbkMsT0FBTyxDQUFDLENBQUM7Z0JBQ1YsQ0FBQztnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV0RyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBdEpELG9DQXNKQyJ9
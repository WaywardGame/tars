define(["require", "exports", "game/entity/IStats", "game/tile/Terrains", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../navigation/Navigation", "../../Objective", "../../utilities/Movement", "../core/MoveToTarget"], function (require, exports, IStats_1, Terrains_1, TileHelpers_1, Vector2_1, Navigation_1, Objective_1, Movement_1, MoveToTarget_1) {
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
            return "Running away";
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
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
                score -= distance * 3000;
                for (const point of movementPath.path) {
                    const index = `${point.x},${point.y}`;
                    let pointScore = scoreCache.get(index);
                    if (pointScore === undefined) {
                        pointScore = 0;
                        const pointZ = { ...point, z: context.player.z };
                        pointScore += navigation.getPenaltyFromPoint(pointZ) * 10;
                        TileHelpers_1.default.findMatchingTiles(pointZ, (_, tile) => {
                            var _a;
                            if (tile.creature !== undefined) {
                                pointScore += 10000;
                            }
                            if ((_a = tile.doodad) === null || _a === void 0 ? void 0 : _a.blocksMove()) {
                                pointScore += 20;
                            }
                            const terrainType = TileHelpers_1.default.getType(tile);
                            const terrainDescription = Terrains_1.default[terrainType];
                            if (terrainDescription) {
                                if (!terrainDescription.passable && !terrainDescription.water) {
                                    pointScore += 20;
                                }
                                if (terrainDescription.water) {
                                    pointScore += 400;
                                }
                            }
                            return true;
                        }, {
                            canVisitTile: (nextPoint) => Vector2_1.default.squaredDistance(point, nextPoint) <= safetyCheckDistanceSq,
                        });
                        scoreCache.set(index, pointScore);
                    }
                    score += pointScore;
                    pointsWithSafety.push([nearbyOpenTile.point, score]);
                }
            }
            pointsWithSafety.sort((a, b) => a[1] - b[1]);
            const objectives = [];
            const bestPoint = pointsWithSafety.length > 0 ? pointsWithSafety[0] : undefined;
            console.log("move to", bestPoint);
            if (bestPoint) {
                if (context.calculatingDifficulty) {
                    return 0;
                }
                console.log("move to", bestPoint[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBZ0IsRUFBbUIscUJBQXFCLEVBQUU7WUFDdEYsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUFtQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQUs7UUFFdkYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNqRixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sY0FBYyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNwRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0QsTUFBTSxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUdwQyxNQUFNLGVBQWUsR0FBRyxxQkFBVyxDQUFDLGlCQUFpQixDQUNwRCxPQUFPLENBQUMsTUFBTSxFQUNkLENBQUMsS0FBSyxFQUFFLElBQUks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
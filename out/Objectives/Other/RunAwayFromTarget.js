define(["require", "exports", "game/entity/Entity", "game/entity/IStats", "game/tile/Terrains", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../core/objective/Objective", "../core/MoveToTarget"], function (require, exports, Entity_1, IStats_1, Terrains_1, TileHelpers_1, Vector2_1, Objective_1, MoveToTarget_1) {
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
            return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.maxRunAwayDistance}`;
        }
        getStatus() {
            return `Running away from ${this.target instanceof Entity_1.default ? this.target.getName() : `(${this.target.x},${this.target.y},${this.target.z})`}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const nearbyTilesDistance = this.maxRunAwayDistance;
            const nearbyTilesDistanceSq = Math.pow(nearbyTilesDistance, 2);
            const navigation = context.utilities.navigation;
            const nearbyOpenTiles = TileHelpers_1.default.findMatchingTiles(context.island, context.human, (_, point, tile) => {
                const terrainType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[terrainType];
                if (terrainDescription &&
                    ((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.human.stat.get(IStats_1.Stat.Stamina).value <= 1))) {
                    return false;
                }
                if (navigation.isDisabledFromPoint(point)) {
                    return false;
                }
                return true;
            }, {
                canVisitTile: (_, nextPoint) => Vector2_1.default.squaredDistance(context.human, nextPoint) <= nearbyTilesDistanceSq,
            });
            const pointsWithSafety = [];
            const scoreCache = new Map();
            for (const nearbyOpenTile of nearbyOpenTiles) {
                const movementPath = await context.utilities.movement.getMovementPath(context, nearbyOpenTile.point, false);
                if (!movementPath.path) {
                    continue;
                }
                let score = 0;
                const distance = Vector2_1.default.squaredDistance(context.human, nearbyOpenTile.point);
                score -= distance * 200;
                for (const point of movementPath.path) {
                    const index = `${point.x},${point.y}`;
                    let pointScore = scoreCache.get(index);
                    if (pointScore === undefined) {
                        pointScore = 0;
                        const pointZ = { ...point, z: context.human.z };
                        pointScore += navigation.getPenaltyFromPoint(pointZ) * 10;
                        const tile = context.island.getTileFromPoint(pointZ);
                        if (tile.doodad?.blocksMove()) {
                            pointScore += 2000;
                        }
                        const terrainType = TileHelpers_1.default.getType(tile);
                        const terrainDescription = Terrains_1.default[terrainType];
                        if (terrainDescription) {
                            if (!terrainDescription.passable && !terrainDescription.water) {
                                pointScore += 2000;
                            }
                        }
                        TileHelpers_1.default.findMatchingTiles(context.island, pointZ, (_, point, tile) => {
                            pointScore += navigation.getPenaltyFromPoint(point, tile);
                            return true;
                        }, {
                            canVisitTile: (_, nextPoint) => Vector2_1.default.squaredDistance(point, nextPoint) <= safetyCheckDistanceSq,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBeUIsRUFBbUIscUJBQXFCLEVBQUU7WUFDL0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFLO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sWUFBWSxnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM5SSxDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtC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
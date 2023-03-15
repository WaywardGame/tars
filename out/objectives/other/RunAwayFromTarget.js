define(["require", "exports", "game/entity/Entity", "game/entity/IStats", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget"], function (require, exports, Entity_1, IStats_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
            const nearbyOpenTiles = context.human.tile.findMatchingTiles((tile) => {
                const terrainDescription = tile.description();
                if (terrainDescription &&
                    ((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.human.stat.get(IStats_1.Stat.Stamina).value <= 1))) {
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
                    const index = `${point.x},${point.y}`;
                    let pointScore = scoreCache.get(index);
                    if (pointScore === undefined) {
                        pointScore = 0;
                        const tile = context.island.getTileFromPoint({ ...point, z: context.human.z });
                        pointScore += navigation.getPenalty(tile) * 10;
                        if (tile.doodad?.blocksMove()) {
                            pointScore += 2000;
                        }
                        const terrainDescription = tile.description();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBeUIsRUFBbUIscUJBQXFCLEVBQUU7WUFDL0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFLO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sWUFBWSxnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM5SSxDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtC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
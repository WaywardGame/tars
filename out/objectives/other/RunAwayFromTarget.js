define(["require", "exports", "game/entity/Entity", "game/entity/IStats", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget"], function (require, exports, Entity_1, IStats_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
                const terrainDescription = tile.description;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBeUIsRUFBbUIscUJBQXFCLEVBQUU7WUFDL0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFLO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sWUFBWSxnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM5SSxDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtC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
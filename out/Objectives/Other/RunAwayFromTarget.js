define(["require", "exports", "game/entity/Entity", "game/entity/IStats", "game/tile/Terrains", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../navigation/Navigation", "../../Objective", "../../utilities/Movement", "../core/MoveToTarget"], function (require, exports, Entity_1, IStats_1, Terrains_1, TileHelpers_1, Vector2_1, Navigation_1, Objective_1, Movement_1, MoveToTarget_1) {
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
            const nearbyOpenTiles = TileHelpers_1.default.findMatchingTiles(context.island, context.player, (_, point, tile) => {
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
                canVisitTile: (_, nextPoint) => Vector2_1.default.squaredDistance(context.player, nextPoint) <= nearbyTilesDistanceSq,
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
                        const tile = context.island.getTileFromPoint(pointZ);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUM5QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0QsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsTUFBeUIsRUFBbUIscUJBQXFCLEVBQUU7WUFDL0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFLO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDakYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHFCQUFxQixJQUFJLENBQUMsTUFBTSxZQUFZLGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzlJLENBQUM7UUFFZSxTQUFTO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQ3BELE1BQU0s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
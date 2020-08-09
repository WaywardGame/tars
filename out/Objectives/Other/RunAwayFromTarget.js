define(["require", "exports", "entity/action/IAction", "entity/player/IPlayer", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../../Navigation/Navigation", "../../Objective", "../Core/ExecuteAction"], function (require, exports, IAction_1, IPlayer_1, Terrains_1, Vector2_1, TileHelpers_1, Navigation_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RunAwayFromTarget extends Objective_1.default {
        constructor(target) {
            super();
            this.target = target;
        }
        getIdentifier() {
            return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z})`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const navigation = Navigation_1.default.get();
            const validPoints = navigation.getValidPoints(context.player, false)
                .filter(point => {
                const tile = game.getTileFromPoint(point);
                if (tile.creature !== undefined || (tile.doodad !== undefined && tile.doodad.blocksMove())) {
                    return false;
                }
                const terrainType = TileHelpers_1.default.getType(tile);
                const terrainInfo = Terrains_1.default[terrainType];
                if (terrainInfo && (!terrainInfo.passable && !terrainInfo.water)) {
                    return false;
                }
                return true;
            })
                .sort((pointA, pointB) => {
                const scoreA = navigation.getPenaltyFromPoint(pointA);
                const scoreB = navigation.getPenaltyFromPoint(pointB);
                if (scoreA > scoreB) {
                    return 1;
                }
                if (scoreA < scoreB) {
                    return -1;
                }
                return Vector2_1.default.squaredDistance(pointA, context.player) > Vector2_1.default.squaredDistance(pointB, context.player) ? 1 : -1;
            });
            this.log.info("Valid points", validPoints);
            const objectives = [];
            const bestPoint = validPoints.length > 0 ? validPoints[0] : undefined;
            if (bestPoint) {
                if (context.calculatingDifficulty) {
                    return 0;
                }
                const direction = IPlayer_1.getDirectionFromMovement(bestPoint.x - context.player.x, bestPoint.y - context.player.y);
                if (direction !== context.player.facingDirection) {
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.UpdateDirection, (context, action) => {
                        action.execute(context.player, direction, undefined);
                    }));
                }
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                    action.execute(context.player, direction);
                }));
            }
            else {
                this.log.info("Unable to run away from target");
            }
            return objectives;
        }
    }
    exports.default = RunAwayFromTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVuQXdheUZyb21UYXJnZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9PdGhlci9SdW5Bd2F5RnJvbVRhcmdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUV2RCxZQUE2QixNQUFnQjtZQUM1QyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFVO1FBRTdDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDakYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDcEMsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztpQkFDbEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtvQkFDM0YsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sV0FBVyxHQUFHLGtCQUFtQixD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
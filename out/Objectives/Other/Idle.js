define(["require", "exports", "game/entity/action/IAction", "game/IGame", "utilities/game/TileHelpers", "../../IObjective", "../../ITars", "../../Objective", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../core/Restart"], function (require, exports, IAction_1, IGame_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Idle extends Objective_1.default {
        constructor(canMoveToIdle = true) {
            super();
            this.canMoveToIdle = canMoveToIdle;
        }
        getIdentifier() {
            return "Idle";
        }
        getStatus() {
            return "Idling";
        }
        async execute(context) {
            const objectivePipelines = [];
            if (game.getTurnMode() === IGame_1.TurnMode.RealTime ||
                game.nextTickTime === 0 ||
                (game.lastTickTime !== undefined && (game.lastTickTime + (game.getTickSpeed() * game.interval) + 200) > game.absoluteTime)) {
                objectivePipelines.push(new Lambda_1.default(async (context, lambda) => {
                    lambda.log.info("Smart idling");
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }
            else {
                if (this.canMoveToIdle) {
                    const target = TileHelpers_1.default.findMatchingTile(context.player, (_, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                    if (target) {
                        this.log.info("Moving to idle position");
                        objectivePipelines.push(new MoveToTarget_1.default(target, false));
                    }
                }
                objectivePipelines.push(new ExecuteAction_1.default(IAction_1.ActionType.Idle, (context, action) => {
                    action.execute(context.player);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }
            objectivePipelines.push(new Restart_1.default().setStatus(this));
            return objectivePipelines;
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = Idle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLGdCQUF5QixJQUFJO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBRG9CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtRQUUxRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBaUIsRUFBRSxDQUFDO1lBRTVDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLGdCQUFRLENBQUMsUUFBUTtnQkFDM0MsSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDO2dCQUN2QixDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUU1SCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzVELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUVwQjtpQkFBTTtnQkFDTixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQ3ZCLE1BQU0sTUFBTSxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxlQUFlLEVBQUUsOEJBQXNCLEVBQUUsQ0FBQyxDQUFDO29CQUM1TixJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUV6QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUN6RDtpQkFDRDtnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM5RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0IsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEI7WUFJRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFdkQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRVMsaUJBQWlCO1lBQzFCLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBcERELHVCQW9EQyJ9
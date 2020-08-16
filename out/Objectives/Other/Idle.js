define(["require", "exports", "entity/action/IAction", "game/IGame", "utilities/TileHelpers", "../../IObjective", "../../ITars", "../../Objective", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget"], function (require, exports, IAction_1, IGame_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1) {
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
        async execute(context) {
            const objectivePipelines = [];
            if (game.getTurnMode() === IGame_1.TurnMode.RealTime ||
                game.nextTickTime === 0 ||
                (game.lastTickTime !== undefined && (game.lastTickTime + (game.getTickSpeed() * game.interval) + 200) > game.absoluteTime)) {
                objectivePipelines.push(new Lambda_1.default(async (context, lambda) => {
                    lambda.log.info("Smart idling");
                    return IObjective_1.ObjectiveResult.Complete;
                }));
            }
            else {
                if (this.canMoveToIdle) {
                    const target = TileHelpers_1.default.findMatchingTile(context.player, (_, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, ITars_1.defaultMaxTilesChecked);
                    if (target) {
                        this.log.info("Moving to idle position");
                        objectivePipelines.push(new MoveToTarget_1.default(target, false));
                    }
                }
                objectivePipelines.push(new ExecuteAction_1.default(IAction_1.ActionType.Idle, (context, action) => {
                    action.execute(context.player);
                }));
            }
            objectivePipelines.push(new Lambda_1.default(async () => IObjective_1.ObjectiveResult.Restart));
            return objectivePipelines;
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = Idle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLGdCQUF5QixJQUFJO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBRG9CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtRQUUxRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQWlCLEVBQUUsQ0FBQztZQUU1QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVE7Z0JBQzNDLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQztnQkFDdkIsQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFFNUgsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM1RCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUVKO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDdkIsTUFBTSxNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSw4QkFBc0IsQ0FBQyxDQUFDO29CQUN2TSxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUV6QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUN6RDtpQkFDRDtnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM5RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBSUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLDRCQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUV6RSxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFUyxpQkFBaUI7WUFDMUIsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUEvQ0QsdUJBK0NDIn0=
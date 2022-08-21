define(["require", "exports", "game/entity/action/actions/Idle", "game/IGame", "utilities/game/TileHelpers", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../core/Restart"], function (require, exports, Idle_1, IGame_1, TileHelpers_1, ITars_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1) {
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
                    const target = TileHelpers_1.default.findMatchingTile(context.island, context.human, (island, _2, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !island.isTileFull(tile) && !tile.doodad, { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                    if (target) {
                        this.log.info("Moving to idle position");
                        objectivePipelines.push(new MoveToTarget_1.default(target, false));
                    }
                }
                objectivePipelines.push(new ExecuteAction_1.default(Idle_1.default, []).setStatus(this));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY0EsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLGdCQUF5QixJQUFJO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBRG9CLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtRQUUxRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBaUIsRUFBRSxDQUFDO1lBRTVDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLGdCQUFRLENBQUMsUUFBUTtnQkFDM0MsSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDO2dCQUN2QixDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUU1SCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzVELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUVwQjtpQkFBTTtnQkFDTixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQ3ZCLE1BQU0sTUFBTSxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxlQUFlLEVBQUUsOEJBQXNCLEVBQUUsQ0FBQyxDQUFDO29CQUN0UCxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUV6QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUN6RDtpQkFDRDtnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLGNBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMzRTtZQUlELGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV2RCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFa0IsaUJBQWlCO1lBQ25DLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBakRELHVCQWlEQyJ9
define(["require", "exports", "game/entity/action/actions/Idle", "game/IGame", "utilities/game/TileHelpers", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../core/Restart"], function (require, exports, Idle_1, IGame_1, TileHelpers_1, ITars_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Idle extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return `Idle:${this.options?.force}:${this.options?.canMoveToIdle}`;
        }
        getStatus() {
            return "Idling";
        }
        async execute(context) {
            const objectivePipelines = [];
            if (!this.options?.force &&
                (game.getTurnMode() === IGame_1.TurnMode.RealTime || game.nextTickTime === 0 ||
                    (game.lastTickTime !== undefined && (game.lastTickTime + (game.getTickSpeed() * game.interval) + 200) > game.absoluteTime))) {
                objectivePipelines.push(new Lambda_1.default(async (context, lambda) => {
                    lambda.log.info("Smart idling");
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }
            else {
                if (this.options?.canMoveToIdle) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBbUJBLE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixPQUErQjtZQUMzRCxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUF3QjtRQUU1RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQWlCLEVBQUUsQ0FBQztZQUU1QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLO2dCQUN2QixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUM7b0JBQ25FLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFFOUgsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM1RCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFcEI7aUJBQU07Z0JBQ04sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRTtvQkFDaEMsTUFBTSxNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLGVBQWUsRUFBRSw4QkFBc0IsRUFBRSxDQUFDLENBQUM7b0JBQ3RQLElBQUksTUFBTSxFQUFFO3dCQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7d0JBRXpDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7cUJBQ3pEO2lCQUNEO2dCQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsY0FBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzNFO1lBSUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXZELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVrQixpQkFBaUI7WUFDbkMsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUFqREQsdUJBaURDIn0=
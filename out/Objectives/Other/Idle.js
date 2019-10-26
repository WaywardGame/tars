define(["require", "exports", "entity/action/IAction", "utilities/TileHelpers", "../../ITars", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, TileHelpers_1, ITars_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Idle extends Objective_1.default {
        constructor(move = true) {
            super();
            this.move = move;
        }
        getIdentifier() {
            return "Idle";
        }
        async execute(context) {
            if (this.move) {
                const target = TileHelpers_1.default.findMatchingTile(context.player, (_, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, ITars_1.defaultMaxTilesChecked);
                if (target) {
                    this.log.info("Moving to idle position");
                    return [
                        new MoveToTarget_1.default(target, false),
                        new ExecuteAction_1.default(IAction_1.ActionType.Idle, (context, action) => {
                            action.execute(context.player);
                        }),
                    ];
                }
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Idle, (context, action) => {
                action.execute(context.player);
            });
        }
        getBaseDifficulty() {
            return 1;
        }
    }
    exports.default = Idle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLE9BQWdCLElBQUk7WUFDaEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFFakQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2QsTUFBTSxNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSw4QkFBc0IsQ0FBQyxDQUFDO2dCQUN2TSxJQUFJLE1BQU0sRUFBRTtvQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUV6QyxPQUFPO3dCQUNOLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO3dCQUMvQixJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoQyxDQUFDLENBQUM7cUJBQ0YsQ0FBQztpQkFDRjthQUNEO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzdELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLGlCQUFpQjtZQUMxQixPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQWpDRCx1QkFpQ0MifQ==
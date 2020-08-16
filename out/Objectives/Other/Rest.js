define(["require", "exports", "entity/action/IAction", "entity/player/IPlayer", "../../Objective", "../../Utilities/Item", "../../Utilities/Object", "../../Utilities/Tile", "../Core/ExecuteAction", "../Interrupt/ReduceWeight", "../Utility/MoveToLand", "./Idle", "./RunAwayFromTarget"], function (require, exports, IAction_1, IPlayer_1, Objective_1, Item_1, Object_1, Tile_1, ExecuteAction_1, ReduceWeight_1, MoveToLand_1, Idle_1, RunAwayFromTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rest extends Objective_1.default {
        constructor(force = false) {
            super();
            this.force = force;
        }
        getIdentifier() {
            return "Rest";
        }
        async execute(context) {
            if (Tile_1.isSwimming(context)) {
                return new MoveToLand_1.default();
            }
            const nearbyCreature = Object_1.getNearbyCreature(context.player);
            if (nearbyCreature !== undefined) {
                this.log.info(`Nearby creature ${nearbyCreature.getName(false).getString()} will prevent resting`);
                const objectivePipelines = [
                    [new Idle_1.default(false)],
                ];
                if (context.player.getWeightStatus() === IPlayer_1.WeightStatus.Overburdened) {
                    if (this.force) {
                        objectivePipelines.push([new ReduceWeight_1.default({ allowReservedItems: true }), new RunAwayFromTarget_1.default(nearbyCreature)]);
                    }
                }
                else {
                    objectivePipelines.push([new RunAwayFromTarget_1.default(nearbyCreature)]);
                }
                return objectivePipelines;
            }
            const item = Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Rest)[0];
            if (item) {
                return new ExecuteAction_1.default(IAction_1.ActionType.Sleep, (context, action) => {
                    action.execute(context.player, item);
                });
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Rest, (context, action) => {
                action.execute(context.player);
            });
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixRQUFpQixLQUFLO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxpQkFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QixPQUFPLElBQUksb0JBQVUsRUFBRSxDQUFDO2FBQ3hCO1lBRUQsTUFBTSxjQUFjLEdBQUcsMEJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBRW5HLE1BQU0sa0JBQWtCLEdBQW1CO29CQUMxQyxDQUFDLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqQixDQUFDO2dCQUVGLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksRUFBRTtvQkFDbkUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSwyQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pIO2lCQUVEO3FCQUFNO29CQUNOLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqRTtnQkFHRCxPQUFPLGtCQUFrQixDQUFDO2FBQzFCO1lBRUQsTUFBTSxJQUFJLEdBQUcsK0JBQXdCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzlELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FFRDtJQWhERCx1QkFnREMifQ==
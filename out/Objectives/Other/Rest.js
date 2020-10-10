define(["require", "exports", "entity/action/IAction", "entity/player/IPlayer", "../../Objective", "../../Utilities/Item", "../../Utilities/Object", "../../Utilities/Player", "../../Utilities/Tile", "../Core/ExecuteAction", "../Interrupt/ReduceWeight", "../Utility/MoveToLand", "./Idle", "./RunAwayFromTarget"], function (require, exports, IAction_1, IPlayer_1, Objective_1, Item_1, Object_1, Player_1, Tile_1, ExecuteAction_1, ReduceWeight_1, MoveToLand_1, Idle_1, RunAwayFromTarget_1) {
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
            if (Tile_1.isOverWater(context) && !Player_1.isUsingVehicle(context)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixRQUFpQixLQUFLO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxrQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckQsT0FBTyxJQUFJLG9CQUFVLEVBQUUsQ0FBQzthQUN4QjtZQUVELE1BQU0sY0FBYyxHQUFHLDBCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2dCQUVuRyxNQUFNLGtCQUFrQixHQUFtQjtvQkFDMUMsQ0FBQyxJQUFJLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakIsQ0FBQztnQkFFRixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssc0JBQVksQ0FBQyxZQUFZLEVBQUU7b0JBQ25FLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHNCQUFZLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksMkJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqSDtpQkFFRDtxQkFBTTtvQkFDTixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDakU7Z0JBR0QsT0FBTyxrQkFBa0IsQ0FBQzthQUMxQjtZQUVELE1BQU0sSUFBSSxHQUFHLCtCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksSUFBSSxFQUFFO2dCQUNULE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDN0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBRUQ7SUFoREQsdUJBZ0RDIn0=
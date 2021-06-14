define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "../../Objective", "../../utilities/Creature", "../../utilities/Item", "../../utilities/Player", "../../utilities/Tile", "../core/ExecuteAction", "../interrupt/ReduceWeight", "../utility/MoveToLand", "./Idle", "./RunAwayFromTarget"], function (require, exports, IAction_1, IPlayer_1, Objective_1, Creature_1, Item_1, Player_1, Tile_1, ExecuteAction_1, ReduceWeight_1, MoveToLand_1, Idle_1, RunAwayFromTarget_1) {
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
        getStatus() {
            return "Resting";
        }
        async execute(context) {
            if (Tile_1.tileUtilities.isSwimmingOrOverWater(context) && !Player_1.playerUtilities.isUsingVehicle(context)) {
                return new MoveToLand_1.default();
            }
            const nearbyCreatures = Creature_1.creatureUtilities.getNearbyCreatures(context.player);
            if (nearbyCreatures.length > 0) {
                const nearbyCreature = nearbyCreatures[0];
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
                    objectivePipelines.push([new RunAwayFromTarget_1.default(nearbyCreature, 8)]);
                }
                return objectivePipelines;
            }
            const item = Item_1.itemUtilities.getInventoryItemsWithUse(context, IAction_1.ActionType.Rest)[0];
            if (item) {
                return new ExecuteAction_1.default(IAction_1.ActionType.Sleep, (context, action) => {
                    action.execute(context.player, item);
                }).setStatus(this);
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Rest, (context, action) => {
                action.execute(context.player);
            }).setStatus(this);
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixRQUFpQixLQUFLO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLG9CQUFhLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBZSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDN0YsT0FBTyxJQUFJLG9CQUFVLEVBQUUsQ0FBQzthQUN4QjtZQUVELE1BQU0sZUFBZSxHQUFHLDRCQUFpQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2dCQUVuRyxNQUFNLGtCQUFrQixHQUFtQjtvQkFDMUMsQ0FBQyxJQUFJLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakIsQ0FBQztnQkFFRixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssc0JBQVksQ0FBQyxZQUFZLEVBQUU7b0JBQ25FLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHNCQUFZLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksMkJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqSDtpQkFFRDtxQkFBTTtvQkFDTixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BFO2dCQUdELE9BQU8sa0JBQWtCLENBQUM7YUFDMUI7WUFFRCxNQUFNLElBQUksR0FBRyxvQkFBYSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLElBQUksSUFBSSxFQUFFO2dCQUNULE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNuQjtZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztLQUVEO0lBdERELHVCQXNEQyJ9
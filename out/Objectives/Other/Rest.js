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
            if (Tile_1.tileUtilities.isOverWater(context) && !Player_1.playerUtilities.isUsingVehicle(context)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLE1BQXFCLElBQUssU0FBUSxtQkFBUztRQUUxQyxZQUE2QixRQUFpQixLQUFLO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLG9CQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQWUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25GLE9BQU8sSUFBSSxvQkFBVSxFQUFFLENBQUM7YUFDeEI7WUFFRCxNQUFNLGVBQWUsR0FBRyw0QkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0UsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUxQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztnQkFFbkcsTUFBTSxrQkFBa0IsR0FBbUI7b0JBQzFDLENBQUMsSUFBSSxjQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2pCLENBQUM7Z0JBRUYsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxLQUFLLHNCQUFZLENBQUMsWUFBWSxFQUFFO29CQUNuRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2Ysa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLDJCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDakg7aUJBRUQ7cUJBQU07b0JBQ04sa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSwyQkFBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwRTtnQkFHRCxPQUFPLGtCQUFrQixDQUFDO2FBQzFCO1lBRUQsTUFBTSxJQUFJLEdBQUcsb0JBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLElBQUksRUFBRTtnQkFDVCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkI7WUFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDN0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7S0FFRDtJQXRERCx1QkFzREMifQ==
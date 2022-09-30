define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "game/entity/action/actions/Extinguish", "game/entity/action/actions/Sleep", "game/entity/action/actions/Rest", "../../core/objective/Objective", "../core/ExecuteAction", "../interrupt/ReduceWeight", "../utility/moveTo/MoveToLand", "./Idle", "./RunAwayFromTarget"], function (require, exports, IAction_1, IPlayer_1, Extinguish_1, Sleep_1, Rest_1, Objective_1, ExecuteAction_1, ReduceWeight_1, MoveToLand_1, Idle_1, RunAwayFromTarget_1) {
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
            if (context.utilities.tile.isSwimmingOrOverWater(context) && !context.utilities.player.isUsingVehicle(context)) {
                return new MoveToLand_1.default();
            }
            const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context);
            if (nearbyCreatures.length > 0) {
                const nearbyCreature = nearbyCreatures[0];
                this.log.info(`Nearby creature ${nearbyCreature.getName().getString()} will prevent resting`);
                const objectivePipelines = [
                    [new Idle_1.default({ canMoveToIdle: false })],
                ];
                if (context.human.getWeightStatus() === IPlayer_1.WeightStatus.Overburdened) {
                    if (this.force) {
                        objectivePipelines.push([new ReduceWeight_1.default({ allowReservedItems: true }), new RunAwayFromTarget_1.default(nearbyCreature)]);
                    }
                }
                else {
                    objectivePipelines.push([new RunAwayFromTarget_1.default(nearbyCreature, 8)]);
                }
                return objectivePipelines;
            }
            const objectivePipeline = [];
            const extinguishableItem = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Extinguish)[0];
            if (extinguishableItem) {
                objectivePipeline.push(new ExecuteAction_1.default(Extinguish_1.default, [extinguishableItem]));
            }
            const bed = context.inventory.bed;
            if (bed) {
                objectivePipeline.push(new ExecuteAction_1.default(Sleep_1.default, [bed]).setStatus(this));
            }
            else {
                objectivePipeline.push(new ExecuteAction_1.default(Rest_1.default, []).setStatus(this));
            }
            return objectivePipeline;
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLFFBQWlCLEtBQUs7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBaUI7UUFFbkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQy9HLE9BQU8sSUFBSSxvQkFBVSxFQUFFLENBQUM7YUFDeEI7WUFFRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBRTlGLE1BQU0sa0JBQWtCLEdBQW1CO29CQUMxQyxDQUFDLElBQUksY0FBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ3BDLENBQUM7Z0JBRUYsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxLQUFLLHNCQUFZLENBQUMsWUFBWSxFQUFFO29CQUNsRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2Ysa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLDJCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDakg7aUJBRUQ7cUJBQU07b0JBQ04sa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSwyQkFBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwRTtnQkFHRCxPQUFPLGtCQUFrQixDQUFDO2FBQzFCO1lBRUQsTUFBTSxpQkFBaUIsR0FBaUIsRUFBRSxDQUFDO1lBRTNDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUcsSUFBSSxrQkFBa0IsRUFBRTtnQkFFdkIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUU7WUFFRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUNsQyxJQUFJLEdBQUcsRUFBRTtnQkFDUixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLGVBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFeEU7aUJBQU07Z0JBQ04saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxjQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDMUU7WUFFRCxPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7S0FFRDtJQTdERCx1QkE2REMifQ==
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
                    [new Idle_1.default(false)],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO1FBRTFDLFlBQTZCLFFBQWlCLEtBQUs7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBaUI7UUFFbkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQy9HLE9BQU8sSUFBSSxvQkFBVSxFQUFFLENBQUM7YUFDeEI7WUFFRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBRTlGLE1BQU0sa0JBQWtCLEdBQW1CO29CQUMxQyxDQUFDLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqQixDQUFDO2dCQUVGLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksRUFBRTtvQkFDbEUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNmLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSwyQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pIO2lCQUVEO3FCQUFNO29CQUNOLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEU7Z0JBR0QsT0FBTyxrQkFBa0IsQ0FBQzthQUMxQjtZQUVELE1BQU0saUJBQWlCLEdBQWlCLEVBQUUsQ0FBQztZQUUzQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlHLElBQUksa0JBQWtCLEVBQUU7Z0JBRXZCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVFO1lBRUQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDbEMsSUFBSSxHQUFHLEVBQUU7Z0JBQ1IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxlQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBRXhFO2lCQUFNO2dCQUNOLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsY0FBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzFFO1lBRUQsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO0tBRUQ7SUE3REQsdUJBNkRDIn0=
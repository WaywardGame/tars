define(["require", "exports", "entity/action/IAction", "../../Objective", "../../Utilities/Doodad", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/StartWaterStillDesalination"], function (require, exports, IAction_1, Objective_1, Doodad_1, ExecuteAction_1, MoveToTarget_1, StartWaterStillDesalination_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromStill extends Objective_1.default {
        constructor(waterStill, item) {
            super();
            this.waterStill = waterStill;
            this.item = item;
        }
        getIdentifier() {
            return `GatherWaterFromStill:${this.waterStill}:${this.item}`;
        }
        async execute(context) {
            if (!Doodad_1.isWaterStillDrinkable(this.waterStill)) {
                return new StartWaterStillDesalination_1.default(this.waterStill);
            }
            return [
                new MoveToTarget_1.default(this.waterStill, true),
                new ExecuteAction_1.default(IAction_1.ActionType.UseItem, (context, action) => {
                    action.execute(context.player, this.item, IAction_1.ActionType.GatherWater);
                }),
            ];
        }
    }
    exports.default = GatherWaterFromStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFMUQsWUFBNkIsVUFBa0IsRUFBbUIsSUFBVTtZQUMzRSxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU07UUFFNUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLDhCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxJQUFJLHFDQUEyQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUV4RDtZQUVELE9BQU87Z0JBQ04sSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO2dCQUN2QyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUF4QkQsdUNBd0JDIn0=
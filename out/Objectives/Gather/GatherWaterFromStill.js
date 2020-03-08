define(["require", "exports", "entity/action/IAction", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/StartWaterStillDesalination"], function (require, exports, IAction_1, Objective_1, ExecuteAction_1, MoveToTarget_1, StartWaterStillDesalination_1) {
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
            if (this.waterStill.gatherReady === undefined) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFMUQsWUFBNkIsVUFBa0IsRUFBbUIsSUFBVTtZQUMzRSxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU07UUFFNUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzlDLE9BQU8sSUFBSSxxQ0FBMkIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDeEQ7WUFFRCxPQUFPO2dCQUNOLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztnQkFDdkMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN6RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxvQkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUM7YUFDRixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBdkJELHVDQXVCQyJ9
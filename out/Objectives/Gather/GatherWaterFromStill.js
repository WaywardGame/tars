define(["require", "exports", "entity/action/IAction", "../../IObjective", "../../Objective", "../../Utilities/Doodad", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/Idle", "../Other/StartWaterStillDesalination"], function (require, exports, IAction_1, IObjective_1, Objective_1, Doodad_1, ExecuteAction_1, MoveToTarget_1, Idle_1, StartWaterStillDesalination_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromStill extends Objective_1.default {
        constructor(waterStill, item, allowStartingWaterStill, allowWaitingForWaterStill) {
            super();
            this.waterStill = waterStill;
            this.item = item;
            this.allowStartingWaterStill = allowStartingWaterStill;
            this.allowWaitingForWaterStill = allowWaitingForWaterStill;
        }
        getIdentifier() {
            return `GatherWaterFromStill:${this.waterStill}:${this.item}:${this.allowStartingWaterStill}`;
        }
        async execute(context) {
            if (!Doodad_1.isWaterStillDrinkable(this.waterStill)) {
                if (this.allowStartingWaterStill) {
                    const objectives = [
                        new StartWaterStillDesalination_1.default(this.waterStill),
                    ];
                    if (this.allowWaitingForWaterStill) {
                        objectives.push(new MoveToTarget_1.default(this.waterStill, true, { range: 5 }));
                        objectives.push(new Idle_1.default().addDifficulty(100));
                    }
                    return objectives;
                }
                return IObjective_1.ObjectiveResult.Impossible;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFMUQsWUFBNkIsVUFBa0IsRUFBbUIsSUFBVSxFQUFtQix1QkFBaUMsRUFBbUIseUJBQW1DO1lBQ3JMLEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVE7WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUFtQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQVU7WUFBbUIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFVO1FBRXRMLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvRixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsOEJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM1QyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtvQkFFakMsTUFBTSxVQUFVLEdBQWlCO3dCQUNoQyxJQUFJLHFDQUEyQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7cUJBQ2hELENBQUM7b0JBRUYsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7d0JBQ25DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFHdkUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUMvQztvQkFFRCxPQUFPLFVBQVUsQ0FBQztpQkFDbEI7Z0JBRUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE9BQU87Z0JBQ04sSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO2dCQUN2QyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUF2Q0QsdUNBdUNDIn0=
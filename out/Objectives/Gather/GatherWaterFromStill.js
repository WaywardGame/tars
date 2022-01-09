define(["require", "exports", "game/entity/action/IAction", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../other/EmptyWaterContainer", "../core/ReserveItems"], function (require, exports, IAction_1, IObjective_1, Objective_1, MoveToTarget_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, EmptyWaterContainer_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromStill extends Objective_1.default {
        constructor(waterStill, item, options) {
            super();
            this.waterStill = waterStill;
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            var _a;
            return `GatherWaterFromStill:${this.waterStill}:${this.item}:${(_a = this.options) === null || _a === void 0 ? void 0 : _a.allowStartingWaterStill}`;
        }
        getStatus() {
            return `Gathering water from ${this.waterStill.getName()}`;
        }
        async execute(context) {
            var _a, _b, _c;
            if (!context.utilities.doodad.isWaterStillDrinkable(this.waterStill)) {
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.allowStartingWaterStill) {
                    const objectives = [
                        new ReserveItems_1.default(this.item),
                        new StartWaterStillDesalination_1.default(this.waterStill),
                    ];
                    if ((_b = this.options) === null || _b === void 0 ? void 0 : _b.allowWaitingForWaterStill) {
                        if (!((_c = this.options) === null || _c === void 0 ? void 0 : _c.onlyIdleWhenWaitingForWaterStill)) {
                            objectives.push(new MoveToTarget_1.default(this.waterStill, true, { range: 5 }));
                        }
                        objectives.push(new Idle_1.default().addDifficulty(100));
                    }
                    return objectives;
                }
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [
                new ReserveItems_1.default(this.item),
            ];
            if (!context.utilities.item.canGatherWater(this.item)) {
                objectives.push(new EmptyWaterContainer_1.default(this.item));
            }
            objectives.push(new MoveToTarget_1.default(this.waterStill, true));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.GatherLiquid, this.item)
                .setStatus(() => `Gathering water from ${this.waterStill.getName()}`));
            return objectives;
        }
    }
    exports.default = GatherWaterFromStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFVBQWtCLEVBQW1CLElBQVUsRUFBbUIsT0FBK0M7WUFDN0ksS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXdDO1FBRTlJLENBQUM7UUFFTSxhQUFhOztZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzVELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNyRSxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsdUJBQXVCLEVBQUU7b0JBRTFDLE1BQU0sVUFBVSxHQUFpQjt3QkFDaEMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzNCLElBQUkscUNBQTJCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztxQkFDaEQsQ0FBQztvQkFFRixJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUseUJBQXlCLEVBQUU7d0JBQzVDLElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZ0NBQWdDLENBQUEsRUFBRTs0QkFDcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3lCQUN2RTt3QkFHRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQy9DO29CQUVELE9BQU8sVUFBVSxDQUFDO2lCQUNsQjtnQkFFRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCO2dCQUNoQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUMzQixDQUFDO1lBRUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNwRDtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUM3RCxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFeEUsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBckRELHVDQXFEQyJ9
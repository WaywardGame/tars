define(["require", "exports", "game/entity/action/IAction", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../../utilities/Doodad", "../other/item/UseItem", "../../utilities/Item", "../other/EmptyWaterContainer"], function (require, exports, IAction_1, IObjective_1, Objective_1, MoveToTarget_1, Idle_1, StartWaterStillDesalination_1, Doodad_1, UseItem_1, Item_1, EmptyWaterContainer_1) {
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
            if (!Doodad_1.doodadUtilities.isWaterStillDrinkable(this.waterStill)) {
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.allowStartingWaterStill) {
                    const objectives = [
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
            const objectives = [];
            if (!Item_1.itemUtilities.canGatherWater(this.item)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFVBQWtCLEVBQW1CLElBQVUsRUFBbUIsT0FBK0M7WUFDN0ksS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXdDO1FBRTlJLENBQUM7UUFFTSxhQUFhOztZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzVELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxJQUFJLENBQUMsd0JBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzVELElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsRUFBRTtvQkFFMUMsTUFBTSxVQUFVLEdBQWlCO3dCQUNoQyxJQUFJLHFDQUEyQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7cUJBQ2hELENBQUM7b0JBRUYsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHlCQUF5QixFQUFFO3dCQUM1QyxJQUFJLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLGdDQUFnQyxDQUFBLEVBQUU7NEJBQ3BELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt5QkFDdkU7d0JBR0QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUMvQztvQkFFRCxPQUFPLFVBQVUsQ0FBQztpQkFDbEI7Z0JBRUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxDQUFDLG9CQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3BEO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQzdELFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV4RSxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFsREQsdUNBa0RDIn0=
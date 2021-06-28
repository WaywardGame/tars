define(["require", "exports", "game/entity/action/IAction", "../../IObjective", "../../Objective", "../core/MoveToTarget", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../../utilities/Doodad", "../other/item/UseItem", "../../utilities/Item", "../other/EmptyWaterContainer"], function (require, exports, IAction_1, IObjective_1, Objective_1, MoveToTarget_1, Idle_1, StartWaterStillDesalination_1, Doodad_1, UseItem_1, Item_1, EmptyWaterContainer_1) {
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
        getStatus() {
            return `Gathering water from ${this.waterStill.getName()}`;
        }
        async execute(context) {
            if (!Doodad_1.doodadUtilities.isWaterStillDrinkable(this.waterStill)) {
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
            const objectives = [];
            if (!Item_1.itemUtilities.canGatherWater(this.item)) {
                objectives.push(new EmptyWaterContainer_1.default(this.item));
            }
            objectives.push(new MoveToTarget_1.default(this.waterStill, true));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.GatherWater, this.item)
                .setStatus(() => `Gathering water from ${this.waterStill.getName()}`));
            return objectives;
        }
    }
    exports.default = GatherWaterFromStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFMUQsWUFBNkIsVUFBa0IsRUFBbUIsSUFBVSxFQUFtQix1QkFBaUMsRUFBbUIseUJBQW1DO1lBQ3JMLEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVE7WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUFtQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQVU7WUFBbUIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFVO1FBRXRMLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvRixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM1RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsd0JBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzVELElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUVqQyxNQUFNLFVBQVUsR0FBaUI7d0JBQ2hDLElBQUkscUNBQTJCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztxQkFDaEQsQ0FBQztvQkFFRixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTt3QkFDbkMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUd2RSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQy9DO29CQUVELE9BQU8sVUFBVSxDQUFDO2lCQUNsQjtnQkFFRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLENBQUMsb0JBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDNUQsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXhFLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQWhERCx1Q0FnREMifQ==
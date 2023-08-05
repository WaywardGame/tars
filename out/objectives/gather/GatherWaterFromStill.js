define(["require", "exports", "game/entity/action/IAction", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../other/EmptyWaterContainer", "game/doodad/IDoodad", "../other/doodad/StartSolarStill"], function (require, exports, IAction_1, IObjective_1, Objective_1, MoveToTarget_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, EmptyWaterContainer_1, IDoodad_1, StartSolarStill_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromStill extends Objective_1.default {
        constructor(waterOrSolarStill, item, options) {
            super();
            this.waterOrSolarStill = waterOrSolarStill;
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            return `GatherWaterFromStill:${this.waterOrSolarStill}:${this.item}:${this.options?.allowStartingWaterStill}`;
        }
        getStatus() {
            return `Gathering water from ${this.waterOrSolarStill.getName()}`;
        }
        async execute(context) {
            if (!context.utilities.doodad.isWaterStillDrinkable(this.waterOrSolarStill)) {
                if (this.options?.allowStartingWaterStill) {
                    const objectives = [
                        this.waterOrSolarStill.type === IDoodad_1.DoodadType.SolarStill ? new StartSolarStill_1.default(this.waterOrSolarStill) : new StartWaterStillDesalination_1.default(this.waterOrSolarStill),
                    ];
                    if (this.options?.allowWaitingForWater) {
                        if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
                            objectives.push(new MoveToTarget_1.default(this.waterOrSolarStill, true, { range: 5 }));
                        }
                        objectives.push(new Idle_1.default().addDifficulty(100));
                    }
                    return objectives;
                }
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            if (!context.utilities.item.canGatherWater(this.item)) {
                objectives.push(new EmptyWaterContainer_1.default(this.item));
            }
            objectives.push(new MoveToTarget_1.default(this.waterOrSolarStill, true));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.GatherLiquid, this.item)
                .setStatus(() => `Gathering water from ${this.waterOrSolarStill.getName()}`));
            return objectives;
        }
    }
    exports.default = GatherWaterFromStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tU3RpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXJGcm9tU3RpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBc0JBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLGlCQUF5QixFQUFtQixJQUFVLEVBQW1CLE9BQStDO1lBQ3BKLEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUTtZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXdDO1FBRXJKLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQztRQUMvRyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ25FLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDNUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFO29CQUUxQyxNQUFNLFVBQVUsR0FBaUI7d0JBQ2hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssb0JBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUkseUJBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxxQ0FBMkIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7cUJBQzdKLENBQUM7b0JBRUYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFO3dCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRTs0QkFDcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7eUJBQzlFO3dCQUdELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDL0M7b0JBRUQsT0FBTyxVQUFVLENBQUM7aUJBQ2xCO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUM3RCxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvRSxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFsREQsdUNBa0RDIn0=
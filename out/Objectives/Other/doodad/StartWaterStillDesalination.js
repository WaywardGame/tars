define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../core/Restart", "../../gather/GatherWater", "../../interrupt/RepairItem", "../item/UseItem", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../EmptyWaterContainer", "../../../core/ITars", "./StokeFire"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, GatherWater_1, RepairItem_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1, StokeFire_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartWaterStillDesalination extends Objective_1.default {
        constructor(waterStill, options = {}) {
            super();
            this.waterStill = waterStill;
            this.options = options;
        }
        getIdentifier() {
            return `StartWaterStillDesalination:${this.waterStill}`;
        }
        getStatus() {
            return `Starting desalination process for ${this.waterStill.getName()}`;
        }
        async execute(context) {
            if (!this.options.forceStoke && context.utilities.doodad.isWaterStillDrinkable(this.waterStill)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const waterStillDescription = this.waterStill.description();
            if (!waterStillDescription) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            const availableWaterContainers = AnalyzeInventory_1.default.getItems(context, ITars_1.inventoryItemInfo["waterContainer"]);
            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(waterContainer));
            if (!this.options.disablePouring && this.waterStill.gatherReady === undefined) {
                let isWaterInContainer = false;
                if (availableWaterContainer) {
                    isWaterInContainer = context.utilities.item.isDrinkableItem(availableWaterContainer);
                    if (availableWaterContainer.minDur !== undefined &&
                        availableWaterContainer.maxDur !== undefined &&
                        (availableWaterContainer.minDur / availableWaterContainer.maxDur) < 0.6) {
                        objectives.push(new RepairItem_1.default(availableWaterContainer));
                    }
                }
                else if (this.waterStill.stillContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                }
                else {
                    this.log.info("Moving to detach container");
                    objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DetachContainer, (context, action) => {
                        action.execute(context.player);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus(() => `Detaching container from ${this.waterStill.getName()}`));
                }
                if (!isWaterInContainer) {
                    objectives.push(new GatherWater_1.default(availableWaterContainer, { disallowWaterStill: true }));
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                this.log.info("Going to pour water into the water still");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Pour, availableWaterContainer));
            }
            if (!this.options.disableAttaching && !this.waterStill.stillContainer) {
                this.log.info("No still container");
                if (availableWaterContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                }
                if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                    objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                objectives.push(new PickUpAllTileItems_1.default(this.waterStill));
                this.log.info("Moving to detach container");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.AttachContainer, availableWaterContainer));
            }
            if (!this.options.disableStarting) {
                if (this.options.forceStoke) {
                    objectives.push(new StokeFire_1.default(this.waterStill));
                }
                else if (!waterStillDescription.providesFire) {
                    if (this.options.forceStarting || context.utilities.base.isNearBase(context) || context.player.stat.get(IStats_1.Stat.Thirst).value <= 3) {
                        objectives.push(new StokeFire_1.default(this.waterStill));
                        objectives.push(new Restart_1.default());
                    }
                    else {
                        this.log.info("Too far away from water still");
                        return IObjective_1.ObjectiveResult.Ignore;
                    }
                }
                else if (this.waterStill.decay !== undefined && this.waterStill.gatherReady !== undefined) {
                    if (this.waterStill.decay <= this.waterStill.gatherReady) {
                        this.log.info(`Going to stoke fire. Water still decay is ${this.waterStill.decay}. Gather ready is ${this.waterStill.gatherReady}`);
                        objectives.push(new StokeFire_1.default(this.waterStill));
                        objectives.push(new Restart_1.default());
                    }
                    else {
                        return IObjective_1.ObjectiveResult.Ignore;
                    }
                }
            }
            return objectives;
        }
    }
    exports.default = StartWaterStillDesalination;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFtQ0EsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0IsRUFBbUIsVUFBd0QsRUFBRTtZQUMzSCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1EO1FBRTVILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUNBQXFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUVoRyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDM0IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSx3QkFBd0IsR0FBRywwQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUV6RyxNQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFdkosSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFFOUUsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Z0JBRy9CLElBQUksdUJBQXVCLEVBQUU7b0JBQzVCLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUVyRixJQUFJLHVCQUF1QixDQUFDLE1BQU0sS0FBSyxTQUFTO3dCQUMvQyx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDNUMsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFO3dCQUV6RSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7cUJBQ3pEO2lCQUVEO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUN4RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQXFCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2lCQUUvRDtxQkFBTTtvQkFFTixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO29CQUU1QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRXpELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNqRixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDL0IsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLDRCQUE0QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM3RTtnQkFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBRXhCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4RjtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXpELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7Z0JBRzFELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBRXBDLElBQUksdUJBQXVCLEtBQUssU0FBUyxFQUFFO29CQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQXFCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLHVCQUF1QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLEVBQUU7b0JBRy9GLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7aUJBQ2xFO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFekQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUV6RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUc1QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7YUFDbEY7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7Z0JBQ2xDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7b0JBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUVoRDtxQkFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFO29CQUUvQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7d0JBRXZJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7cUJBRS9CO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7d0JBQy9DLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7cUJBQzlCO2lCQUVEO3FCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFFNUYsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTt3QkFDekQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNkNBQTZDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxxQkFBcUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dCQUVwSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO3FCQUUvQjt5QkFBTTt3QkFFTixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO3FCQUM5QjtpQkFDRDthQUNEO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBbklELDhDQW1JQyJ9
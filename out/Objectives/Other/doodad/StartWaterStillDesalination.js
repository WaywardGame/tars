define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../core/Restart", "../../gather/GatherWater", "../../interrupt/RepairItem", "../item/UseItem", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../EmptyWaterContainer", "../../../core/ITars", "./StokeFire", "../../../core/context/IContext", "../../contextData/SetContextData"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, GatherWater_1, RepairItem_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1, StokeFire_1, IContext_1, SetContextData_1) {
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
            const objectives = [
                new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
            ];
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
                    objectives.push(new AcquireWaterContainer_1.default());
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
                    objectives.push(new AcquireWaterContainer_1.default());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFxQ0EsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0IsRUFBbUIsVUFBd0QsRUFBRTtZQUMzSCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1EO1FBRTVILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUNBQXFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUVoRyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDM0IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQjtnQkFDaEMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO2FBQzVGLENBQUM7WUFFRixNQUFNLHdCQUF3QixHQUFHLDBCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUseUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sdUJBQXVCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUV2SixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUU5RSxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFHL0IsSUFBSSx1QkFBdUIsRUFBRTtvQkFDNUIsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBRXJGLElBQUksdUJBQXVCLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQy9DLHVCQUF1QixDQUFDLE1BQU0sS0FBSyxTQUFTO3dCQUM1QyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLEVBQUU7d0JBRXpFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztxQkFDekQ7aUJBRUQ7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQkFBcUIsRUFBRSxDQUFDLENBQUM7aUJBRTdDO3FCQUFNO29CQUVOLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0JBRTVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFekQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ2pGLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMvQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsNEJBQTRCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzdFO2dCQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFFeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3hGO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFekQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQztnQkFHMUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtnQkFDdEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFFcEMsSUFBSSx1QkFBdUIsS0FBSyxTQUFTLEVBQUU7b0JBRTFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQkFBcUIsRUFBRSxDQUFDLENBQUM7aUJBQzdDO2dCQUVELElBQUksdUJBQXVCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsRUFBRTtvQkFHL0YsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFtQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztpQkFDbEU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUV6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRXpELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBRzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQzthQUNsRjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBRWhEO3FCQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7b0JBRS9DLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTt3QkFFdkksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQztxQkFFL0I7eUJBQU07d0JBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQzt3QkFDL0MsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztxQkFDOUI7aUJBRUQ7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO29CQUU1RixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFO3dCQUN6RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLHFCQUFxQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7d0JBRXBJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7cUJBRS9CO3lCQUFNO3dCQUVOLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7cUJBQzlCO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF2SUQsOENBdUlDIn0=
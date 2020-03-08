define(["require", "exports", "entity/action/IAction", "../../IObjective", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../Acquire/Item/Specific/AcquireWaterContainer", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Gather/GatherWater", "../Interrupt/RepairItem", "./StartFire", "./StokeFire", "./UseItem"], function (require, exports, IAction_1, IObjective_1, Objective_1, Base_1, Item_1, AcquireWaterContainer_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, GatherWater_1, RepairItem_1, StartFire_1, StokeFire_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartWaterStillDesalination extends Objective_1.default {
        constructor(waterStill) {
            super();
            this.waterStill = waterStill;
        }
        getIdentifier() {
            return `StartWaterStillDesalination:${this.waterStill}`;
        }
        async execute(context) {
            const waterStillDescription = this.waterStill.description();
            const objectives = [];
            if (this.waterStill.gatherReady !== undefined && this.waterStill.gatherReady <= 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.waterStill.gatherReady === undefined) {
                let isWaterInContainer = false;
                if (context.inventory.waterContainer !== undefined) {
                    isWaterInContainer = Item_1.canDrinkItem(context.inventory.waterContainer);
                    if (context.inventory.waterContainer.minDur !== undefined &&
                        context.inventory.waterContainer.maxDur !== undefined &&
                        (context.inventory.waterContainer.minDur / context.inventory.waterContainer.maxDur) < 0.6) {
                        objectives.push(new RepairItem_1.default(context.inventory.waterContainer));
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
                    }));
                }
                if (!isWaterInContainer) {
                    objectives.push(new GatherWater_1.default(context.inventory.waterContainer));
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Pour, context.inventory.waterContainer));
            }
            else if (!this.waterStill.stillContainer) {
                this.log.info("No still container");
                if (context.inventory.waterContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default());
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                const waterStillTile = this.waterStill.getTile();
                if (waterStillTile.containedItems && waterStillTile.containedItems.length > 0) {
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.PickupAllItems, (context, action) => {
                        action.execute(context.player);
                    }));
                }
                objectives.push(new UseItem_1.default(IAction_1.ActionType.AttachContainer, context.inventory.waterContainer));
            }
            else if (waterStillDescription && !waterStillDescription.providesFire) {
                if (Base_1.isNearBase(context)) {
                    objectives.push(new Lambda_1.default(async () => {
                        StartWaterStillDesalination.waterStillStokeFireTargetDecay = 300;
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                    objectives.push(new StartFire_1.default(this.waterStill));
                }
                else {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            else if (StartWaterStillDesalination.waterStillStokeFireTargetDecay !== undefined) {
                if (this.waterStill.decay !== undefined && this.waterStill.decay < StartWaterStillDesalination.waterStillStokeFireTargetDecay) {
                    objectives.push(new StokeFire_1.default(this.waterStill));
                }
                else {
                    StartWaterStillDesalination.waterStillStokeFireTargetDecay = undefined;
                }
            }
            else {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            return objectives;
        }
    }
    exports.default = StartWaterStillDesalination;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW1CQSxNQUFxQiwyQkFBNEIsU0FBUSxtQkFBUztRQUlqRSxZQUE2QixVQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFNUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7Z0JBRWxGLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFHOUMsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Z0JBRS9CLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUNuRCxrQkFBa0IsR0FBRyxtQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBRXBFLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQ3hELE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxTQUFT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
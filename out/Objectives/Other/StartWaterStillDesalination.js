define(["require", "exports", "entity/action/IAction", "entity/IStats", "../../IObjective", "../../Objective", "../../Utilities/Base", "../../Utilities/Doodad", "../../Utilities/Item", "../Acquire/Item/Specific/AcquireWaterContainer", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Gather/GatherWater", "../Interrupt/RepairItem", "./StartFire", "./StokeFire", "./UseItem"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, Base_1, Doodad_1, Item_1, AcquireWaterContainer_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, GatherWater_1, RepairItem_1, StartFire_1, StokeFire_1, UseItem_1) {
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
            if (Doodad_1.isWaterStillDrinkable(this.waterStill)) {
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
                this.log.info("Moving to detach container");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.AttachContainer, context.inventory.waterContainer));
            }
            else if (waterStillDescription && !waterStillDescription.providesFire) {
                if (Base_1.isNearBase(context) || context.player.stat.get(IStats_1.Stat.Thirst).value <= 3) {
                    objectives.push(new Lambda_1.default(async () => {
                        StartWaterStillDesalination.waterStillStokeFireTargetDecay.set(this.waterStill.id, 250);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                    objectives.push(new StartFire_1.default(this.waterStill));
                    objectives.push(new StokeFire_1.default(this.waterStill));
                }
                else {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            else {
                const waterStillStokeFireTargetDecay = StartWaterStillDesalination.waterStillStokeFireTargetDecay.get(this.waterStill.id);
                if (waterStillStokeFireTargetDecay !== undefined) {
                    if (this.waterStill.decay !== undefined && this.waterStill.decay < waterStillStokeFireTargetDecay) {
                        objectives.push(new StokeFire_1.default(this.waterStill));
                    }
                    else {
                        StartWaterStillDesalination.waterStillStokeFireTargetDecay.delete(this.waterStill.id);
                    }
                }
                else {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            return objectives;
        }
    }
    exports.default = StartWaterStillDesalination;
    StartWaterStillDesalination.waterStillStokeFireTargetDecay = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQXFCQSxNQUFxQiwyQkFBNEIsU0FBUSxtQkFBUztRQUlqRSxZQUE2QixVQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFNUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLDhCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFFM0MsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUc5QyxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFHL0IsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBQ25ELGtCQUFrQixHQUFHLG1CQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFFcEUsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDeEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQ3JELENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMs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
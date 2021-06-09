define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "../../../IObjective", "../../../Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../core/Restart", "../../gather/GatherWater", "../../interrupt/RepairItem", "./StokeFire", "../item/UseItem", "../../../utilities/Base", "../../../utilities/Doodad", "../../../utilities/Item"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, GatherWater_1, RepairItem_1, StokeFire_1, UseItem_1, Base_1, Doodad_1, Item_1) {
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
        getStatus() {
            return `Starting desalination process for ${this.waterStill.getName()}`;
        }
        async execute(context) {
            var _a;
            if (Doodad_1.doodadUtilities.isWaterStillDrinkable(this.waterStill)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const waterStillDescription = this.waterStill.description();
            if (!waterStillDescription) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            const availableWaterContainer = (_a = context.inventory.waterContainer) === null || _a === void 0 ? void 0 : _a.find(waterContainer => !itemManager.isInGroup(waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater));
            if (this.waterStill.gatherReady === undefined) {
                let isWaterInContainer = false;
                if (availableWaterContainer) {
                    isWaterInContainer = Item_1.itemUtilities.isDrinkableItem(availableWaterContainer);
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
                    }).setStatus(() => `Detaching container from ${this.waterStill.getName()}`));
                }
                if (!isWaterInContainer) {
                    objectives.push(new GatherWater_1.default(availableWaterContainer, { disallowWaterStill: true }));
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                this.log.info("Going to pour water into the water still");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Pour, availableWaterContainer));
            }
            if (!this.waterStill.stillContainer) {
                this.log.info("No still container");
                if (availableWaterContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default());
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                const waterStillTile = this.waterStill.getTile();
                if (waterStillTile.containedItems && waterStillTile.containedItems.length > 0) {
                    for (const item of waterStillTile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, context.player.inventory);
                        }));
                    }
                }
                this.log.info("Moving to detach container");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.AttachContainer, availableWaterContainer));
            }
            if (!waterStillDescription.providesFire) {
                if (Base_1.baseUtilities.isNearBase(context) || context.player.stat.get(IStats_1.Stat.Thirst).value <= 3) {
                    objectives.push(new StokeFire_1.default(this.waterStill));
                    objectives.push(new Restart_1.default());
                }
                else {
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
            return objectives;
        }
    }
    exports.default = StartWaterStillDesalination;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF5QkEsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLCtCQUErQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHFDQUFxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDekUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLElBQUksd0JBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBRTNELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUMzQixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLHVCQUF1QixHQUFHLE1BQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLDBDQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHFCQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBRWpMLElBQUksSUFBSSxDQUFD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
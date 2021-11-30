define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "../../../IObjective", "../../../Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../core/Restart", "../../gather/GatherWater", "../../interrupt/RepairItem", "./StokeFire", "../item/UseItem", "../../../utilities/Base", "../../../utilities/Doodad", "../../../utilities/Item", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../../../ITars", "../EmptyWaterContainer"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, GatherWater_1, RepairItem_1, StokeFire_1, UseItem_1, Base_1, Doodad_1, Item_1, PickUpAllTileItems_1, AnalyzeInventory_1, ITars_1, EmptyWaterContainer_1) {
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
            if (!this.options.forceStoke && Doodad_1.doodadUtilities.isWaterStillDrinkable(this.waterStill)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const waterStillDescription = this.waterStill.description();
            if (!waterStillDescription) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            const availableWaterContainers = AnalyzeInventory_1.default.getItems(context, ITars_1.inventoryItemInfo["waterContainer"]);
            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !Item_1.itemUtilities.isSafeToDrinkItem(waterContainer));
            if (!this.options.disablePouring && this.waterStill.gatherReady === undefined) {
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
                if (availableWaterContainer && !Item_1.itemUtilities.canGatherWater(availableWaterContainer)) {
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
                    if (this.options.forceStarting || Base_1.baseUtilities.isNearBase(context) || context.player.stat.get(IStats_1.Stat.Thirst).value <= 3) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFvQ0EsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0IsRUFBbUIsVUFBd0QsRUFBRTtZQUMzSCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1EO1FBRTVILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUNBQXFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksd0JBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBRXZGLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUMzQixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLHdCQUF3QixHQUFHLDBCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUseUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sdUJBQXVCLEdB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
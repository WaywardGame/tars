define(["require", "exports", "game/entity/IStats", "game/entity/action/actions/AttachContainer", "game/entity/action/actions/DetachContainer", "game/entity/action/actions/Pour", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../core/Restart", "../../interrupt/RepairItem", "../item/UseItem", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../EmptyWaterContainer", "../../../core/ITars", "./StokeFire", "../../acquire/item/specific/AcquireWater"], function (require, exports, IStats_1, AttachContainer_1, DetachContainer_1, Pour_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, RepairItem_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1, StokeFire_1, AcquireWater_1) {
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
            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));
            let isPouringWater = false;
            let detachingContainer = false;
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
                    detachingContainer = true;
                    objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                    objectives.push(new ExecuteAction_1.default(DetachContainer_1.default, []).setStatus(() => `Detaching container from ${this.waterStill.getName()}`));
                }
                if (!isWaterInContainer) {
                    objectives.push(new AcquireWater_1.default({ onlyForDesalination: true }).keepInInventory());
                }
                objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                this.log.info("Going to pour water into the water still");
                objectives.push(new UseItem_1.default(Pour_1.default, availableWaterContainer));
                isPouringWater = true;
            }
            if (!this.options.disableAttaching) {
                if (!this.waterStill.stillContainer) {
                    this.log.info("No still container");
                    if (availableWaterContainer === undefined) {
                        objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                    }
                    if (!isPouringWater && availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                        objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
                    }
                    objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                    objectives.push(new PickUpAllTileItems_1.default(this.waterStill));
                    this.log.info("Moving to attach container");
                    objectives.push(new UseItem_1.default(AttachContainer_1.default, availableWaterContainer));
                }
                else if (detachingContainer) {
                    objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                    objectives.push(new PickUpAllTileItems_1.default(this.waterStill));
                    this.log.info("Moving to attach container");
                    objectives.push(new UseItem_1.default(AttachContainer_1.default));
                }
            }
            if (!this.options.disableStarting) {
                if (this.options.forceStoke) {
                    objectives.push(new StokeFire_1.default(this.waterStill));
                }
                else if (!waterStillDescription.providesFire) {
                    if (this.options.forceStarting || context.utilities.base.isNearBase(context) || context.human.stat.get(IStats_1.Stat.Thirst).value <= 3) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFxQ0EsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0IsRUFBbUIsVUFBd0QsRUFBRTtZQUMzSCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1EO1FBRTVILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUNBQXFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUVoRyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDM0IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSx3QkFBd0IsR0FBRywwQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZ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
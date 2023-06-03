/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/entity/action/actions/AttachContainer", "game/entity/action/actions/DetachContainer", "game/entity/action/actions/Pour", "game/entity/IStats", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../../../acquire/item/specific/AcquireWaterContainer", "../../../core/ExecuteAction", "../../../core/MoveToTarget", "../../../core/Restart", "../../../interrupt/RepairItem", "../../../../core/ITars", "../../../acquire/item/specific/AcquireWater", "../../../analyze/AnalyzeInventory", "../../EmptyWaterContainer", "../../item/UseItem", "../../tile/PickUpAllTileItems", "../StokeFire"], function (require, exports, AttachContainer_1, DetachContainer_1, Pour_1, IStats_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, Restart_1, RepairItem_1, ITars_1, AcquireWater_1, AnalyzeInventory_1, EmptyWaterContainer_1, UseItem_1, PickUpAllTileItems_1, StokeFire_1) {
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
            if (!this.options.forceStoke && context.utilities.doodad.isWaterSourceDoodadDrinkable(this.waterStill)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const waterStillDescription = this.waterStill.description;
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
                    if (availableWaterContainer.durability !== undefined &&
                        availableWaterContainer.durabilityMax !== undefined &&
                        (availableWaterContainer.durability / availableWaterContainer.durabilityMax) < 0.6) {
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
                    objectives.push(new PickUpAllTileItems_1.default(this.waterStill.tile));
                    this.log.info("Moving to attach container");
                    objectives.push(new UseItem_1.default(AttachContainer_1.default, availableWaterContainer));
                }
                else if (detachingContainer) {
                    objectives.push(new MoveToTarget_1.default(this.waterStill, true));
                    objectives.push(new PickUpAllTileItems_1.default(this.waterStill.tile));
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
                        objectives.push(new StokeFire_1.default(this.waterStill, 4));
                        objectives.push(new Restart_1.default());
                    }
                    else {
                        this.log.info("Too far away from water still");
                        return IObjective_1.ObjectiveResult.Ignore;
                    }
                }
                else if (this.waterStill.decay !== undefined && this.waterStill.gatherReady !== undefined) {
                    if (this.waterStill.decay <= this.waterStill.gatherReady) {
                        const estimatedNumbersOfStokes = Math.ceil((this.waterStill.gatherReady - this.waterStill.decay) / 50);
                        this.log.info(`Going to stoke fire. Water still decay is ${this.waterStill.decay}. Gather ready is ${this.waterStill.gatherReady}. Estimated: ${estimatedNumbersOfStokes}`);
                        objectives.push(new StokeFire_1.default(this.waterStill, estimatedNumbersOfStokes));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclN0aWxsRGVzYWxpbmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL3dhdGVyU291cmNlL1N0YXJ0V2F0ZXJTdGlsbERlc2FsaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUF1Q0gsTUFBcUIsMkJBQTRCLFNBQVEsbUJBQVM7UUFFakUsWUFBNkIsVUFBa0IsRUFBbUIsVUFBd0QsRUFBRTtZQUMzSCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1EO1FBRTVILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sK0JBQStCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUNBQXFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUV2RyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUMxRCxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQzNCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sd0JBQXdCLEdBQUcsMEJBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSx5QkFBaUIs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
define(["require", "exports", "Enums", "../../IObjective", "../../Objective", "../AcquireItem", "../GatherWater", "../UseItem"], function (require, exports, Enums_1, IObjective_1, Objective_1, AcquireItem_1, GatherWater_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Thirst extends Objective_1.default {
        onExecute(base, inventory) {
            if (inventory.waterContainer === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            const waterContainerDescription = inventory.waterContainer.description();
            const isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1;
            if (isWaterInContainer && waterContainerDescription.group &&
                (waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfMedicinalWater) !== -1 ||
                    waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfDesalinatedWater) !== -1 ||
                    waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfPurifiedFreshWater) !== -1)) {
                this.log("Drink water from container");
                return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.DrinkItem);
            }
            const waterStill = base.waterStill;
            if (waterStill === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (waterStill.gatherReady) {
                if (isWaterInContainer) {
                    this.log("Emptying water from container");
                    return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.PourOnYourself);
                }
                this.log("Gather water from the water still");
                return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.GatherWater, waterStill);
            }
            else if (waterStill.decay === -1) {
                if (isWaterInContainer) {
                    this.log("Pour water into water still");
                    return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.Pour, waterStill);
                }
                this.log("Gather water from a water tile");
                return new GatherWater_1.default(inventory.waterContainer);
            }
            const waterStillDescription = waterStill.description();
            if (waterStillDescription && waterStillDescription.providesFire) {
                this.log(`Waiting for water to be purified. Decay: ${waterStill.decay}`);
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (inventory.fireStarter !== undefined) {
                if (inventory.fireKindling === undefined) {
                    this.log("Acquire kindling");
                    return new AcquireItem_1.default(Enums_1.ItemTypeGroup.Kindling);
                }
                this.log("Start a fire on the water still");
                return new UseItem_1.default(inventory.fireStarter, Enums_1.ActionType.StartFire, waterStill);
            }
            this.log("Acquire a hand drill");
            return new AcquireItem_1.default(Enums_1.ItemType.HandDrill);
        }
    }
    exports.default = Thirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1N0YXRzL1JlY292ZXJUaGlyc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsWUFBNEIsU0FBUSxtQkFBUztRQUVyQyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFHLENBQUM7WUFDMUUsTUFBTSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRS9ILEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixJQUFJLHlCQUF5QixDQUFDLEtBQUs7Z0JBQ3hELENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN2Rix5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3pGLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxrQkFBVSxDQUFDLFNBQVMs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
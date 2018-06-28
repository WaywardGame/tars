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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcnN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvU3RhdHMvVGhpcnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLFlBQTRCLFNBQVEsbUJBQVM7UUFFckMsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUN2RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRyxDQUFDO1lBQzFFLE1BQU0sa0JBQWtCLEdBQUcseUJBQXlCLENBQUMsR0FBRyxJQUFJLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUvSCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSx5QkFBeUIsQ0FBQyxLQUFLO2dCQUN4RCxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkYseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6Rix5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsa0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNw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
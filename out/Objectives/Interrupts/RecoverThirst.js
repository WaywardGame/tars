define(["require", "exports", "Enums", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./ExecuteAction", "./GatherWater", "./UseItem"], function (require, exports, Enums_1, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItem_1, ExecuteAction_1, GatherWater_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Thirst extends Objective_1.default {
        onExecute(base, inventory) {
            const isEmergency = localPlayer.stats.thirst.value <= 3;
            let isWaterInContainer;
            if (inventory.waterContainer !== undefined) {
                const waterContainerDescription = inventory.waterContainer.description();
                isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1;
                if (isWaterInContainer && waterContainerDescription.group) {
                    if (waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfMedicinalWater) !== -1 ||
                        waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfDesalinatedWater) !== -1 ||
                        waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfPurifiedFreshWater) !== -1) {
                        this.log("Drink water from container");
                        return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.DrinkItem);
                    }
                    if (isEmergency && waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater) !== -1) {
                        this.log("Drink water from container");
                        return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.DrinkItem);
                    }
                }
            }
            if (isEmergency) {
                const closestShallowFreshWater = Helpers.getClosestTileLocation(Enums_1.TerrainType.ShallowFreshWater, localPlayer);
                if (closestShallowFreshWater.length > 0) {
                    const moveResult = Helpers.moveToTargetWithRetries((ignoredTiles) => {
                        for (let i = 0; i < 2; i++) {
                            const target = closestShallowFreshWater[i];
                            const targetTile = game.getTileFromPoint(target.point);
                            if (ignoredTiles.indexOf(targetTile) === -1) {
                                return target.point;
                            }
                        }
                        return undefined;
                    });
                    if (moveResult === ITars_1.MoveResult.NoTarget) {
                        this.log("Can't find freshwater");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else if (moveResult === ITars_1.MoveResult.NoPath) {
                        this.log("Can't path to freshwater");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else if (moveResult !== ITars_1.MoveResult.Complete) {
                        return;
                    }
                    this.log("Drink in front");
                    return new ExecuteAction_1.default(Enums_1.ActionType.DrinkInFront);
                }
            }
            if (inventory.waterContainer === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
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
            if (inventory.fireStarter === undefined) {
                this.log("Acquire a fire starter");
                return new AcquireItem_1.default(undefined, Enums_1.ActionType.StartFire);
            }
            if (inventory.fireKindling === undefined) {
                this.log("Acquire kindling");
                return new AcquireItem_1.default(Enums_1.ItemTypeGroup.Kindling);
            }
            this.log("Start a fire on the water still");
            return new UseItem_1.default(inventory.fireStarter, Enums_1.ActionType.StartFire, waterStill);
        }
    }
    exports.default = Thirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdHMvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxZQUE0QixTQUFRLG1CQUFTO1FBRXJDLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7WUFDdkQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUV4RCxJQUFJLGtCQUF1QyxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRyxDQUFDO2dCQUMxRSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN6SCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUMzRCxFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzFGLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDekYseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM5RixJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireWaterContainer", "./ExecuteAction", "./GatherWater", "./StartFire", "./UseItem"], function (require, exports, IStats_1, Enums_1, Helpers, IObjective_1, ITars_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, GatherWater_1, StartFire_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const waterStill = base.waterStill;
                const isEmergency = localPlayer.getStat(IStats_1.Stat.Thirst).value <= 3 && (!waterStill || !waterStill.gatherReady);
                let isWaterInContainer;
                if (inventory.waterContainer !== undefined) {
                    const waterContainerDescription = inventory.waterContainer.description();
                    isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1;
                    if (isWaterInContainer && waterContainerDescription.group) {
                        if (waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfMedicinalWater) !== -1 ||
                            waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfDesalinatedWater) !== -1 ||
                            waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfPurifiedFreshWater) !== -1) {
                            this.log.info("Drink water from container");
                            return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.DrinkItem);
                        }
                        if (isEmergency && waterContainerDescription.group.indexOf(Enums_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater) !== -1) {
                            this.log.info("Drink water from container");
                            return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.DrinkItem);
                        }
                    }
                }
                if (isEmergency) {
                    const nearestShallowFreshWater = yield Helpers.getNearestTileLocation(Enums_1.TerrainType.ShallowFreshWater, localPlayer);
                    if (nearestShallowFreshWater.length > 0) {
                        const moveResult = yield Helpers.moveToTargetWithRetries((ignoredTiles) => {
                            for (let i = 0; i < 2; i++) {
                                const target = nearestShallowFreshWater[i];
                                const targetTile = game.getTileFromPoint(target.point);
                                if (ignoredTiles.indexOf(targetTile) === -1) {
                                    return target.point;
                                }
                            }
                            return undefined;
                        });
                        if (moveResult === ITars_1.MoveResult.NoTarget) {
                            this.log.info("Can't find freshwater");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        else if (moveResult === ITars_1.MoveResult.NoPath) {
                            this.log.info("Can't path to freshwater");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        else if (moveResult !== ITars_1.MoveResult.Complete) {
                            return;
                        }
                        this.log.info("Drink in front");
                        return new ExecuteAction_1.default(Enums_1.ActionType.DrinkInFront);
                    }
                }
                if (inventory.waterContainer === undefined) {
                    return new AcquireWaterContainer_1.default();
                }
                if (waterStill === undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (waterStill.gatherReady) {
                    if (isWaterInContainer) {
                        this.log.info("Emptying water from container");
                        return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.PourOnYourself);
                    }
                    this.log.info("Gather water from the water still");
                    return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.GatherWater, waterStill);
                }
                else if (waterStill.decay === -1) {
                    if (isWaterInContainer) {
                        this.log.info("Pour water into water still");
                        return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.Pour, waterStill);
                    }
                    this.log.info("Gather water from a water tile");
                    return new GatherWater_1.default(inventory.waterContainer);
                }
                const waterStillDescription = waterStill.description();
                if (waterStillDescription && waterStillDescription.providesFire) {
                    this.log.info(`Waiting for water to be purified. Decay: ${waterStill.decay}`);
                    if (isEmergency) {
                        const moveResult = yield Helpers.moveToTarget(waterStill);
                        if (moveResult === ITars_1.MoveResult.NoPath) {
                            this.log.info("No path to water still");
                            return;
                        }
                        if (moveResult === ITars_1.MoveResult.Moving) {
                            return;
                        }
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new StartFire_1.default(waterStill);
            });
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJUaGlyc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFhQSxtQkFBbUMsU0FBUSxtQkFBUztRQUV0QyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFFbkMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVuSCxJQUFJLGtCQUF1QyxDQUFDO2dCQUM1QyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUMzQyxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFHLENBQUM7b0JBQzFFLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pILElBQUksa0JBQWtCLElBQUkseUJBQXlCLENBQUMsS0FBSyxFQUFFO3dCQUMxRCxJQUFJLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDMUYseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN6Rix5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFB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
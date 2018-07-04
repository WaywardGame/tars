var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "../IObjective", "../Objective", "./AcquireWaterContainer", "./ExecuteAction", "./GatherWater", "./StartFire", "./UseItem", "../Utilities/Movement", "../Utilities/Tile"], function (require, exports, IStats_1, Enums_1, IObjective_1, Objective_1, AcquireWaterContainer_1, ExecuteAction_1, GatherWater_1, StartFire_1, UseItem_1, Movement_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        getHashCode() {
            return "RecoverThirst";
        }
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
                    const nearestShallowFreshWater = yield Tile_1.getNearestTileLocation(Enums_1.TerrainType.ShallowFreshWater, localPlayer);
                    if (nearestShallowFreshWater.length > 0) {
                        const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                            for (let i = 0; i < 2; i++) {
                                const target = nearestShallowFreshWater[i];
                                if (target) {
                                    const targetTile = game.getTileFromPoint(target.point);
                                    if (ignoredTiles.indexOf(targetTile) === -1) {
                                        return target.point;
                                    }
                                }
                            }
                            return undefined;
                        });
                        if (moveResult === Movement_1.MoveResult.NoTarget) {
                            this.log.info("Can't find freshwater");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        else if (moveResult === Movement_1.MoveResult.NoPath) {
                            this.log.info("Can't path to freshwater");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        else if (moveResult !== Movement_1.MoveResult.Complete) {
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
                        const moveResult = yield Movement_1.moveToFaceTarget(waterStill);
                        if (moveResult === Movement_1.MoveResult.NoPath) {
                            this.log.info("No path to water still");
                            return;
                        }
                        if (moveResult === Movement_1.MoveResult.Moving) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJUaGlyc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFjQSxtQkFBbUMsU0FBUSxtQkFBUztRQUU1QyxXQUFXO1lBQ2pCLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFFbkMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVuSCxJQUFJLGtCQUF1QyxDQUFDO2dCQUM1QyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUMzQyxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFHLENBQUM7b0JBQzFFLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pILElBQUksa0JBQWtCLElBQUkseUJBQXlCLENBQUMsS0FBSyxFQUFFO3dCQUMxRCxJQUFJLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDMUYseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN6Rix5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFD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
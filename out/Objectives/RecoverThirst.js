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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJUaGlyc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFjQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFNUMsV0FBVztZQUNqQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBRW5DLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFbkgsSUFBSSxrQkFBdUMsQ0FBQztnQkFDNUMsSUFBSSxTQUFTLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtvQkFDM0MsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRyxDQUFDO29CQUMxRSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6SCxJQUFJLGtCQUFrQixJQUFJLHlCQUF5QixDQUFDLEtBQUssRUFBRTt3QkFDMUQsSUFBSSx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQzFGLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDekYseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8s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
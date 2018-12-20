var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "entity/IStats", "Enums", "../IObjective", "../Objective", "../Utilities/Movement", "../Utilities/Tile", "./AcquireWaterContainer", "./ExecuteAction", "./GatherWater", "./StartFire", "./UseItem"], function (require, exports, IAction_1, IStats_1, Enums_1, IObjective_1, Objective_1, Movement_1, Tile_1, AcquireWaterContainer_1, ExecuteAction_1, GatherWater_1, StartFire_1, UseItem_1) {
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
                    isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(IAction_1.ActionType.DrinkItem) !== -1;
                    if (isWaterInContainer) {
                        if (itemManager.isInGroup(inventory.waterContainer.type, Enums_1.ItemTypeGroup.ContainerOfMedicinalWater) ||
                            itemManager.isInGroup(inventory.waterContainer.type, Enums_1.ItemTypeGroup.ContainerOfDesalinatedWater) ||
                            itemManager.isInGroup(inventory.waterContainer.type, Enums_1.ItemTypeGroup.ContainerOfPurifiedFreshWater)) {
                            this.log.info("Drink water from container");
                            return new UseItem_1.default(inventory.waterContainer, IAction_1.ActionType.DrinkItem);
                        }
                        if (isEmergency && itemManager.isInGroup(inventory.waterContainer.type, Enums_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
                            this.log.info("Drink water from container");
                            return new UseItem_1.default(inventory.waterContainer, IAction_1.ActionType.DrinkItem);
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
                        return new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, action => action.execute(localPlayer));
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
                        return new UseItem_1.default(inventory.waterContainer, IAction_1.ActionType.PourOnYourself);
                    }
                    this.log.info("Gather water from the water still");
                    return new UseItem_1.default(inventory.waterContainer, IAction_1.ActionType.GatherWater, waterStill);
                }
                else if (waterStill.decay === -1) {
                    if (isWaterInContainer) {
                        this.log.info("Pour water into water still");
                        return new UseItem_1.default(inventory.waterContainer, IAction_1.ActionType.Pour, waterStill);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJUaGlyc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFlQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFNUMsV0FBVztZQUNqQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBRW5DLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFbkgsSUFBSSxrQkFBdUMsQ0FBQztnQkFDNUMsSUFBSSxTQUFTLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtvQkFDM0MsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRyxDQUFDO29CQUMxRSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQyxHQUFHLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6SCxJQUFJLGtCQUFrQixFQUFFO3dCQUN2QixJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUscUJBQWEsQ0FBQyx5QkFBeUIsQ0FBQzs0QkFDaEcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxxQkFBYSxDQUFDLDJCQUEyQixDQUFDOzRCQUMvRixXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFB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
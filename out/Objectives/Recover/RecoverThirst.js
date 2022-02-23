define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../gather/GatherWaterWithRecipe", "../acquire/item/AcquireItemByGroup", "../analyze/AnalyzeBase", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, GatherWaterWithRecipe_1, AcquireItemByGroup_1, AnalyzeBase_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return `RecoverThirst:${this.options.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering thirst";
        }
        async execute(context) {
            if (this.options.onlyEmergencies) {
                return this.getEmergencyObjectives(context);
            }
            if (!this.options.exceededThreshold) {
                return this.getBelowThresholdObjectives(context);
            }
            const objectivePipelines = [];
            if (context.inventory.waterContainer !== undefined) {
                for (const waterContainer of context.inventory.waterContainer) {
                    if (context.utilities.item.isDrinkableItem(waterContainer)) {
                        if (context.utilities.item.isSafeToDrinkItem(waterContainer)) {
                            this.log.info("Drink water from container");
                            objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, waterContainer)]);
                        }
                        else {
                            objectivePipelines.push([new GatherWaterWithRecipe_1.default(waterContainer)]);
                        }
                    }
                }
            }
            if (this.options.onlyUseAvailableItems) {
                return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
            }
            if (context.base.waterStill.length === 0) {
                const waterStillObjectives = [];
                if (context.inventory.waterStill !== undefined) {
                    waterStillObjectives.push(new BuildItem_1.default(context.inventory.waterStill));
                }
                if (context.inventory.waterContainer === undefined) {
                    waterStillObjectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                }
                objectivePipelines.push(waterStillObjectives);
            }
            else {
                const waterAndSolarStills = context.base.waterStill.concat(context.base.solarStill);
                const isWaitingForAll = waterAndSolarStills.every(doodad => context.utilities.doodad.isWaterStillDesalinating(doodad));
                if (isWaitingForAll) {
                    if (context.utilities.player.isHealthy(context)) {
                        if (context.base.waterStill.length < 3) {
                            this.log.info("Building another water still while waiting");
                            objectivePipelines.push([
                                new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill),
                                new BuildItem_1.default(),
                                new AnalyzeBase_1.default(),
                            ]);
                        }
                        else if (context.base.solarStill.length < 2) {
                            this.log.info("Building a solar still while waiting");
                            objectivePipelines.push([
                                new AcquireItem_1.default(IItem_1.ItemType.SolarStill),
                                new BuildItem_1.default(),
                                new AnalyzeBase_1.default(),
                            ]);
                        }
                    }
                }
                else {
                    for (const solarOrWaterStill of waterAndSolarStills) {
                        if (context.utilities.doodad.isWaterStillDesalinating(solarOrWaterStill)) {
                            continue;
                        }
                        const stillObjectives = [];
                        if (context.utilities.doodad.isWaterStillDrinkable(solarOrWaterStill)) {
                            stillObjectives.push(new MoveToTarget_1.default(solarOrWaterStill, true));
                            stillObjectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                action.execute(context.actionExecutor);
                                return IObjective_1.ObjectiveResult.Complete;
                            }));
                        }
                        else {
                            stillObjectives.push(solarOrWaterStill.type === IDoodad_1.DoodadType.SolarStill ? new StartSolarStill_1.default(solarOrWaterStill) : new StartWaterStillDesalination_1.default(solarOrWaterStill));
                        }
                        objectivePipelines.push(stillObjectives);
                    }
                }
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
        async getEmergencyObjectives(context) {
            const thirstStat = context.human.stat.get(IStats_1.Stat.Thirst);
            const isEmergency = thirstStat.value <= 3 && context.base.waterStill.concat(context.base.solarStill).every(waterStill => !context.utilities.doodad.isWaterStillDrinkable(waterStill));
            if (!isEmergency) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectivePipelines = [];
            const health = context.human.stat.get(IStats_1.Stat.Health);
            if ((isEmergency && health.value > 4) || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
                const nearestFreshWater = await context.utilities.tile.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
                for (const { point } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(!isEmergency ? 500 : 0));
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                        action.execute(context.actionExecutor);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                    objectivePipelines.push(objectives);
                }
            }
            if (context.base.waterStill.length > 0) {
                const isWaitingForAll = context.base.waterStill.every(doodad => context.utilities.doodad.isWaterStillDesalinating(doodad));
                if (isWaitingForAll) {
                    if ((health.value / health.max) <= 0.3) {
                        this.log.info("Making health items");
                        for (const waterStill of context.base.waterStill) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill),
                                new AcquireItemForAction_1.default(IAction_1.ActionType.Heal).keepInInventory(),
                                new UseItem_1.default(IAction_1.ActionType.Heal),
                            ]);
                        }
                    }
                    else {
                        this.log.info("Running back to wait for water still");
                        for (const waterStill of context.base.waterStill) {
                            objectivePipelines.push([
                                new StartWaterStillDesalination_1.default(waterStill),
                                new Idle_1.default().setStatus("Waiting for water still due to emergency"),
                            ]);
                        }
                    }
                }
                else {
                    for (const waterStill of context.base.waterStill) {
                        if (context.utilities.doodad.isWaterStillDesalinating(waterStill) || context.utilities.doodad.isWaterStillDrinkable(waterStill)) {
                            continue;
                        }
                        if (!context.utilities.doodad.isWaterStillDrinkable(waterStill)) {
                            if (isEmergency) {
                                const stamina = context.human.stat.get(IStats_1.Stat.Stamina);
                                if ((stamina.value / stamina.max) < 0.9) {
                                    objectivePipelines.push([new RecoverStamina_1.default()]);
                                }
                                else {
                                    objectivePipelines.push([
                                        new StartWaterStillDesalination_1.default(waterStill),
                                        new Idle_1.default().setStatus("Waiting for water still due to emergency"),
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
            return objectivePipelines;
        }
        getBelowThresholdObjectives(context) {
            const objectivePipelines = [];
            if (!this.options.onlyUseAvailableItems) {
                if (context.utilities.base.isNearBase(context)) {
                    const thirstStat = context.human.stat.get(IStats_1.Stat.Thirst);
                    for (const waterStill of context.base.waterStill) {
                        if (context.utilities.doodad.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info("Near base, going to drink from water still");
                            objectivePipelines.push([
                                new MoveToTarget_1.default(waterStill, true),
                                new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                    action.execute(context.actionExecutor);
                                    return IObjective_1.ObjectiveResult.Complete;
                                }),
                            ]);
                        }
                    }
                    for (const solarStill of context.base.solarStill) {
                        if (context.utilities.doodad.isWaterStillDrinkable(solarStill) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info("Near base, going to drink from solar still");
                            objectivePipelines.push([
                                new MoveToTarget_1.default(solarStill, true).addDifficulty(-100),
                                new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                    action.execute(context.actionExecutor);
                                    return IObjective_1.ObjectiveResult.Complete;
                                }),
                            ]);
                        }
                    }
                    if (context.inventory.waterContainer !== undefined) {
                        for (const waterContainer of context.inventory.waterContainer) {
                            if (context.utilities.item.isDrinkableItem(waterContainer) && !context.utilities.item.isSafeToDrinkItem(waterContainer)) {
                                objectivePipelines.push([new GatherWaterWithRecipe_1.default(waterContainer)]);
                            }
                        }
                    }
                }
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQ0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM5RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEMsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakQ7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ25ELEtBQUssTUFBTSxjQUFjLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7b0JBQzlELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFO3dCQUMzRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFOzRCQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFD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
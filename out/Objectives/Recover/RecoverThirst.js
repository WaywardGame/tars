define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../gather/GatherWaterWithRecipe", "../acquire/item/AcquireItemByGroup", "../analyze/AnalyzeBase", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, GatherWaterWithRecipe_1, AcquireItemByGroup_1, AnalyzeBase_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        static isEmergency(context) {
            const thirstStat = context.human.stat.get(IStats_1.Stat.Thirst);
            return thirstStat.value <= 3 && context.base.waterStill.concat(context.base.solarStill).every(waterStill => !context.utilities.doodad.isWaterStillDrinkable(waterStill));
        }
        getIdentifier() {
            return `RecoverThirst:${this.options.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering thirst";
        }
        async execute(context) {
            if (this.options.onlyEmergencies) {
                if (!RecoverThirst.isEmergency(context)) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
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
            const objectivePipelines = [];
            const health = context.human.stat.get(IStats_1.Stat.Health);
            if (health.value > 4 || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
                const nearestFreshWater = await context.utilities.tile.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
                for (const { point } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQ0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBT25ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFQTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsT0FBTyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDMUssQ0FBQztRQU1NLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNC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
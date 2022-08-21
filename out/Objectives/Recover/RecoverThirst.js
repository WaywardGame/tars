define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "game/entity/action/actions/DrinkInFront", "game/entity/action/actions/DrinkItem", "game/entity/action/actions/Heal", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../acquire/item/AcquireItemByGroup", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty"], function (require, exports, IAction_1, IStats_1, IItem_1, DrinkInFront_1, DrinkItem_1, Heal_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, AcquireItemByGroup_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1, AcquireWater_1, AddDifficulty_1) {
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
                const safeToDrinkWaterContainers = context.inventory.waterContainer.filter(waterContainer => context.utilities.item.isSafeToDrinkItem(waterContainer));
                for (const waterContainer of safeToDrinkWaterContainers) {
                    this.log.info(`Can safely drink water from ${waterContainer}`);
                    objectivePipelines.push([new UseItem_1.default(DrinkItem_1.default, waterContainer)]);
                }
                if (context.inventory.waterContainer.length !== safeToDrinkWaterContainers.length) {
                    objectivePipelines.push([new AcquireWater_1.default({ onlySafeToDrink: true })]);
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
                            ]);
                        }
                        else if (context.base.solarStill.length < 2) {
                            this.log.info("Building a solar still while waiting");
                            objectivePipelines.push([
                                new AcquireItem_1.default(IItem_1.ItemType.SolarStill),
                                new BuildItem_1.default(),
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
                            stillObjectives.push(new ExecuteAction_1.default(DrinkInFront_1.default, []));
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
                    objectives.push(new ExecuteAction_1.default(DrinkInFront_1.default, []));
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
                                new UseItem_1.default(Heal_1.default),
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
                                new ExecuteAction_1.default(DrinkInFront_1.default, []),
                            ]);
                        }
                    }
                    for (const solarStill of context.base.solarStill) {
                        if (context.utilities.doodad.isWaterStillDrinkable(solarStill) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info("Near base, going to drink from solar still");
                            objectivePipelines.push([
                                new AddDifficulty_1.default(-100),
                                new MoveToTarget_1.default(solarStill, true),
                                new ExecuteAction_1.default(DrinkInFront_1.default, []),
                            ]);
                        }
                    }
                }
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFtQ0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBT25ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFQTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsT0FBTyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDMUssQ0FBQztRQU1NLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNC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
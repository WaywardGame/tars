define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "game/entity/action/actions/DrinkInFront", "game/entity/action/actions/DrinkItem", "game/entity/action/actions/Heal", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../acquire/item/AcquireItemByGroup", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty", "../core/Restart", "../acquire/item/AcquireInventoryItem"], function (require, exports, IAction_1, IStats_1, IItem_1, DrinkInFront_1, DrinkItem_1, Heal_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, AcquireItemByGroup_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1, AcquireWater_1, AddDifficulty_1, Restart_1, AcquireInventoryItem_1) {
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
            return this.options.exceededThreshold ? this.getExceededThresholdObjectives(context) : this.getAboveThresholdObjectives(context);
        }
        async getEmergencyObjectives(context) {
            const objectivePipelines = [];
            const { availableWaterContainers } = context.utilities.item.getWaterContainers(context);
            if (availableWaterContainers.length > 0) {
                objectivePipelines.push([new AcquireWater_1.default({ onlySafeToDrink: true, disallowTerrain: true })]);
            }
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
                        if (context.base.waterStill.length < 3 && context.human.stat.get(IStats_1.Stat.Stamina).value > 2) {
                            this.log.info("Building another water still while waiting");
                            objectivePipelines.push([
                                new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill),
                                new BuildItem_1.default(),
                            ]);
                        }
                        else {
                            for (const waterStill of context.base.waterStill) {
                                objectivePipelines.push([
                                    new StartWaterStillDesalination_1.default(waterStill),
                                    new Idle_1.default().setStatus("Waiting for water still due to emergency"),
                                ]);
                            }
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
        getAboveThresholdObjectives(context) {
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
        async getExceededThresholdObjectives(context) {
            const waterAndSolarStills = context.base.waterStill.concat(context.base.solarStill);
            if (!RecoverThirst.isEmergency(context) && !context.utilities.base.isNearBase(context)) {
                const isDrinkableWaterAvailable = waterAndSolarStills.some(solarOrWaterStill => !context.utilities.doodad.isWaterStillDesalinating(solarOrWaterStill) && context.utilities.doodad.isWaterStillDrinkable(solarOrWaterStill));
                if (isDrinkableWaterAvailable) {
                    const thirst = context.human.stat.get(IStats_1.Stat.Thirst);
                    const changeTimer = thirst.changeTimer;
                    const nextChangeTimer = thirst.nextChangeTimer;
                    if (changeTimer !== undefined && nextChangeTimer !== undefined) {
                        const pathResult = await context.utilities.navigation.findPath(context.utilities.base.getBasePosition(context));
                        if (pathResult) {
                            const pathLength = pathResult.path.length + (context.human.walkPath?.path?.length ?? 0);
                            const turnsUntilThirstHitsZero = ((thirst.value - 1) * nextChangeTimer) + changeTimer - 50;
                            if (turnsUntilThirstHitsZero >= pathLength) {
                                return IObjective_1.ObjectiveResult.Ignore;
                            }
                        }
                    }
                }
            }
            const { safeToDrinkWaterContainers, availableWaterContainers } = context.utilities.item.getWaterContainers(context);
            const objectivePipelines = [];
            for (const waterContainer of safeToDrinkWaterContainers) {
                this.log.info(`Can safely drink water from ${waterContainer}`);
                objectivePipelines.push([new UseItem_1.default(DrinkItem_1.default, waterContainer)]);
            }
            if (!this.options.onlyUseAvailableItems) {
                if (availableWaterContainers.length !== safeToDrinkWaterContainers.length) {
                    objectivePipelines.push([new AcquireWater_1.default({ onlySafeToDrink: true })]);
                }
                if (context.base.waterStill.length === 0) {
                    const waterStillObjectives = [
                        new AcquireInventoryItem_1.default("waterStill"),
                        new BuildItem_1.default(),
                    ];
                    if (context.inventory.waterContainer === undefined) {
                        waterStillObjectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                    }
                    waterStillObjectives.push(new Restart_1.default());
                    objectivePipelines.push(waterStillObjectives);
                }
                else {
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
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFxQ0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBT25ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFQTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsT0FBTyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDMUssQ0FBQztRQU1NLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNC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
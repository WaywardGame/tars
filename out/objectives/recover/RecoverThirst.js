define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "game/entity/action/actions/DrinkInFront", "game/entity/action/actions/DrinkItem", "game/entity/action/actions/Heal", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../acquire/item/AcquireItemByGroup", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty", "../core/Restart"], function (require, exports, IAction_1, IStats_1, IItem_1, DrinkInFront_1, DrinkItem_1, Heal_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, AcquireItemByGroup_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1, AcquireWater_1, AddDifficulty_1, Restart_1) {
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
                    const waterStillObjectives = [];
                    if (context.inventory.waterStill !== undefined) {
                        waterStillObjectives.push(new BuildItem_1.default(context.inventory.waterStill));
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFvQ0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBT25ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFQTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsT0FBTyxVQUFVLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDMUssQ0FBQztRQU1NLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNC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
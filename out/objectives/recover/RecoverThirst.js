define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "game/entity/action/actions/DrinkInFront", "game/entity/action/actions/DrinkItem", "game/entity/action/actions/Heal", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../acquire/item/AcquireItemByGroup", "./RecoverStamina", "../acquire/item/AcquireItem", "../other/doodad/StartSolarStill", "game/doodad/IDoodad", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty", "../core/Restart", "../acquire/item/AcquireInventoryItem", "../../core/navigation/INavigation"], function (require, exports, IAction_1, IStats_1, IItem_1, DrinkInFront_1, DrinkItem_1, Heal_1, IObjective_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, AcquireItemByGroup_1, RecoverStamina_1, AcquireItem_1, StartSolarStill_1, IDoodad_1, AcquireWater_1, AddDifficulty_1, Restart_1, AcquireInventoryItem_1, INavigation_1) {
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
                const nearestFreshWater = context.utilities.tile.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
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
                        const pathResult = context.utilities.navigation.findPath(context.utilities.base.getBasePosition(context));
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
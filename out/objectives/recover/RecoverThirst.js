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
                            const turnsUntilThirstHitsZero = ((thirst.value - 1) * nextChangeTimer) + changeTimer - 10;
                            if (turnsUntilThirstHitsZero >= pathLength) {
                                return IObjective_1.ObjectiveResult.Ignore;
                            }
                        }
                    }
                }
            }
            const objectivePipelines = [];
            if (context.inventory.waterContainer !== undefined) {
                const safeToDrinkWaterContainers = context.inventory.waterContainer.filter(waterContainer => context.utilities.item.isSafeToDrinkItem(context, waterContainer));
                for (const waterContainer of safeToDrinkWaterContainers) {
                    this.log.info(`Can safely drink water from ${waterContainer}`);
                    objectivePipelines.push([new UseItem_1.default(DrinkItem_1.default, waterContainer)]);
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
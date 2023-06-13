/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/action/actions/DrinkInFront", "game/entity/action/actions/DrinkItem", "game/entity/action/actions/Heal", "game/doodad/IDoodad", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/item/UseItem", "./RecoverStamina", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty", "../core/Restart", "../acquire/item/AcquireInventoryItem", "../../core/navigation/INavigation", "../utility/moveTo/MoveToBase", "../other/doodad/StartWaterSourceDoodad"], function (require, exports, IAction_1, IStats_1, DrinkInFront_1, DrinkItem_1, Heal_1, IDoodad_1, IObjective_1, Objective_1, AcquireItemForAction_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, UseItem_1, RecoverStamina_1, AcquireWater_1, AddDifficulty_1, Restart_1, AcquireInventoryItem_1, INavigation_1, MoveToBase_1, StartWaterSourceDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        static isEmergency(context) {
            const thirstStat = context.human.stat.get(IStats_1.Stat.Thirst);
            return thirstStat.value <= 3 && context.utilities.base.getWaterSourceDoodads(context).every(doodad => !context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad));
        }
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
            const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);
            const health = context.human.stat.get(IStats_1.Stat.Health);
            if (health.value > 4 || ((health.value / health.max) >= 0.7 && waterSourceDoodads.length === 0)) {
                const nearestFreshWater = context.utilities.tile.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
                for (const { tile } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(tile, true));
                    objectives.push(new ExecuteAction_1.default(DrinkInFront_1.default, []));
                    objectivePipelines.push(objectives);
                }
            }
            if (waterSourceDoodads.length > 0) {
                const isWaitingForAll = waterSourceDoodads.every(doodad => context.utilities.doodad.isWaterSourceDoodadBusy(doodad));
                if (isWaitingForAll) {
                    if ((health.value / health.max) <= 0.3) {
                        this.log.info("Making health items");
                        for (const doodad of waterSourceDoodads) {
                            objectivePipelines.push([
                                new StartWaterSourceDoodad_1.default(doodad),
                                new AcquireItemForAction_1.default(IAction_1.ActionType.Heal).keepInInventory(),
                                new UseItem_1.default(Heal_1.default),
                            ]);
                        }
                    }
                    else {
                        this.log.info("Running back to wait for water");
                        if (context.human.stat.get(IStats_1.Stat.Stamina).value > 2) {
                            this.log.info("Building another water source while waiting");
                            if (!context.utilities.base.isNearBase(context)) {
                                objectivePipelines.push([new MoveToBase_1.default()]);
                            }
                            objectivePipelines.push([new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()]);
                        }
                        else {
                            for (const doodad of waterSourceDoodads) {
                                objectivePipelines.push([
                                    new StartWaterSourceDoodad_1.default(doodad),
                                    new Idle_1.default().setStatus(`Waiting for ${doodad.getName()} due to emergency`),
                                ]);
                            }
                        }
                    }
                }
                else {
                    for (const doodad of waterSourceDoodads) {
                        if (context.utilities.doodad.isWaterSourceDoodadBusy(doodad) || context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
                            continue;
                        }
                        if (!context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
                            const stamina = context.human.stat.get(IStats_1.Stat.Stamina);
                            if ((stamina.value / stamina.max) < 0.9) {
                                objectivePipelines.push([new RecoverStamina_1.default()]);
                            }
                            else {
                                objectivePipelines.push([
                                    new StartWaterSourceDoodad_1.default(doodad),
                                    new Idle_1.default().setStatus(`Waiting for ${doodad.getName()} due to emergency`),
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
                    const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);
                    for (const doodad of waterSourceDoodads) {
                        if (context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info(`Near base, going to drink from a ${doodad}`);
                            const difficulty = (doodad.type === IDoodad_1.DoodadType.SolarStill && doodad.isInGroup(IDoodad_1.DoodadTypeGroup.Dripstone)) ? -100 : 0;
                            objectivePipelines.push([
                                new AddDifficulty_1.default(difficulty),
                                new MoveToTarget_1.default(doodad, true),
                                new ExecuteAction_1.default(DrinkInFront_1.default, []),
                            ]);
                        }
                    }
                }
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
        async getExceededThresholdObjectives(context) {
            const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);
            if (!RecoverThirst.isEmergency(context) && !context.utilities.base.isNearBase(context)) {
                const isDrinkableWaterAvailable = waterSourceDoodads.some(waterSourceDoodad => !context.utilities.doodad.isWaterSourceDoodadBusy(waterSourceDoodad) && context.utilities.doodad.isWaterSourceDoodadDrinkable(waterSourceDoodad));
                if (isDrinkableWaterAvailable) {
                    const thirst = context.human.stat.get(IStats_1.Stat.Thirst);
                    const changeTimer = thirst.changeTimer;
                    const nextChangeTimer = thirst.nextChangeTimer;
                    if (changeTimer !== undefined && nextChangeTimer !== undefined) {
                        const pathResult = context.utilities.navigation.findPath(context.utilities.base.getBaseTile(context));
                        if (pathResult) {
                            let pathLength = pathResult.path.length + (context.human.walkPath?.path?.length ?? 0);
                            pathLength *= 2;
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
                if (context.base.dripStone.length === 0) {
                    const waterSourceObjectives = [new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()];
                    waterSourceObjectives.push(new Restart_1.default());
                    objectivePipelines.push(waterSourceObjectives);
                }
                else {
                    const isWaitingForAll = waterSourceDoodads.every(doodad => context.utilities.doodad.isWaterSourceDoodadBusy(doodad));
                    if (isWaitingForAll) {
                        if (context.utilities.player.isHealthy(context) && context.utilities.base.isNearBase(context)) {
                            if (context.base.dripStone.length < 3) {
                                this.log.info("Building another drip stone while waiting");
                                objectivePipelines.push([new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()]);
                            }
                            else if (context.base.waterStill.length < 3) {
                                this.log.info("Building another water still while waiting");
                                objectivePipelines.push([new AcquireInventoryItem_1.default("waterStill"), new BuildItem_1.default()]);
                            }
                            else if (context.base.solarStill.length < 2) {
                                this.log.info("Building a solar still while waiting");
                                objectivePipelines.push([new AcquireInventoryItem_1.default("solarStill"), new BuildItem_1.default()]);
                            }
                            else {
                                objectivePipelines.push([new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()]);
                                objectivePipelines.push([new AcquireInventoryItem_1.default("solarStill"), new BuildItem_1.default()]);
                                objectivePipelines.push([new AcquireInventoryItem_1.default("waterStill"), new BuildItem_1.default()]);
                            }
                        }
                    }
                    else {
                        for (const doodad of waterSourceDoodads) {
                            if (context.utilities.doodad.isWaterSourceDoodadBusy(doodad)) {
                                continue;
                            }
                            const waterSourceObjectives = [];
                            if (context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
                                waterSourceObjectives.push(new MoveToTarget_1.default(doodad, true));
                                waterSourceObjectives.push(new ExecuteAction_1.default(DrinkInFront_1.default, []));
                            }
                            else {
                                waterSourceObjectives.push(new StartWaterSourceDoodad_1.default(doodad));
                            }
                            objectivePipelines.push(waterSourceObjectives);
                        }
                    }
                }
            }
            return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFtQ0gsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRTVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBZ0I7WUFDekMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2SyxDQUFDO1FBRUQsWUFBNkIsT0FBOEI7WUFDMUQsS0FBSyxFQUFFLENBQUM7WUFEb0IsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7UUFFM0QsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNC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
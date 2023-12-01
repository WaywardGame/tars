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
define(["require", "exports", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/IStats", "@wayward/game/game/entity/action/actions/DrinkInFront", "@wayward/game/game/entity/action/actions/DrinkItem", "@wayward/game/game/entity/action/actions/Heal", "@wayward/game/game/doodad/IDoodad", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/item/UseItem", "./RecoverStamina", "../acquire/item/specific/AcquireWater", "../core/AddDifficulty", "../core/Restart", "../acquire/item/AcquireInventoryItem", "../../core/navigation/INavigation", "../utility/moveTo/MoveToBase", "../other/doodad/StartWaterSourceDoodad"], function (require, exports, IAction_1, IStats_1, DrinkInFront_1, DrinkItem_1, Heal_1, IDoodad_1, IObjective_1, Objective_1, AcquireItemForAction_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, UseItem_1, RecoverStamina_1, AcquireWater_1, AddDifficulty_1, Restart_1, AcquireInventoryItem_1, INavigation_1, MoveToBase_1, StartWaterSourceDoodad_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFtQ0gsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRTVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBZ0I7WUFDekMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2SyxDQUFDO1FBRUQsWUFBNkIsT0FBOEI7WUFDMUQsS0FBSyxFQUFFLENBQUM7WUFEb0IsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7UUFFM0QsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLENBQUM7Z0JBRUQsT0FBTyxJ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
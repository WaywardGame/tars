define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "../../core/objective/IObjective", "../../core/navigation/INavigation", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "../gather/GatherWaterWithRecipe", "../acquire/item/AcquireItemByGroup", "../analyze/AnalyzeBase", "./RecoverStamina"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, GatherWaterWithRecipe_1, AcquireItemByGroup_1, AnalyzeBase_1, RecoverStamina_1) {
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
                    waterStillObjectives.push(new AcquireWaterContainer_1.default());
                }
                objectivePipelines.push(waterStillObjectives);
            }
            else {
                const isWaitingForAll = context.base.waterStill.every(doodad => context.utilities.doodad.isWaterStillDesalinating(doodad));
                if (isWaitingForAll) {
                    if (context.base.waterStill.length < 3 && context.utilities.player.isHealthy(context)) {
                        this.log.info("Building another water still while waiting");
                        objectivePipelines.push([
                            new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill),
                            new BuildItem_1.default(),
                            new AnalyzeBase_1.default(),
                        ]);
                    }
                }
                else {
                    for (const waterStill of context.base.waterStill) {
                        if (context.utilities.doodad.isWaterStillDesalinating(waterStill)) {
                            continue;
                        }
                        const waterStillObjectives = [];
                        if (context.utilities.doodad.isWaterStillDrinkable(waterStill)) {
                            waterStillObjectives.push(new MoveToTarget_1.default(waterStill, true));
                            waterStillObjectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                action.execute(context.player);
                                return IObjective_1.ObjectiveResult.Complete;
                            }));
                        }
                        else {
                            waterStillObjectives.push(new StartWaterStillDesalination_1.default(waterStill));
                        }
                        objectivePipelines.push(waterStillObjectives);
                    }
                }
            }
            return objectivePipelines;
        }
        async getEmergencyObjectives(context) {
            const thirstStat = context.player.stat.get(IStats_1.Stat.Thirst);
            const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !context.utilities.doodad.isWaterStillDrinkable(waterStill));
            if (!isEmergency) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectivePipelines = [];
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if ((isEmergency && health.value > 4) || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
                const nearestFreshWater = await context.utilities.tile.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
                for (const { point } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(!isEmergency ? 500 : 0));
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                        action.execute(context.player);
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
                                const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
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
                    const thirstStat = context.player.stat.get(IStats_1.Stat.Thirst);
                    for (const waterStill of context.base.waterStill) {
                        if (context.utilities.doodad.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info("Near base, going to drink from water still");
                            objectivePipelines.push([
                                new MoveToTarget_1.default(waterStill, true),
                                new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                    action.execute(context.player);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUE2QkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLE9BQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBRTNELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM5RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEMsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakQ7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ25ELEtBQUssTUFBTSxjQUFjLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7b0JBQzlELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFO3dCQUMzRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFOzRCQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFD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
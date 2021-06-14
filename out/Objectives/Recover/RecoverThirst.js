define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "game/doodad/IDoodad", "../../IObjective", "../../navigation//INavigation", "../../Objective", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../analyze/AnalyzeBase", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "./RecoverStamina", "../../utilities/Tile", "../../utilities/Base", "../../utilities/Doodad", "../../utilities/Player", "../../utilities/Item", "../gather/GatherWaterWithRecipe", "../acquire/Item/AcquireItemForDoodad"], function (require, exports, IAction_1, IStats_1, IItem_1, IDoodad_1, IObjective_1, INavigation_1, Objective_1, AcquireItemForAction_1, AcquireWaterContainer_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, RecoverStamina_1, Tile_1, Base_1, Doodad_1, Player_1, Item_1, GatherWaterWithRecipe_1, AcquireItemForDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        constructor(onlyUseAvailableItems, exceededThreshold, allowEmergencies = false) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
            this.exceededThreshold = exceededThreshold;
            this.allowEmergencies = allowEmergencies;
        }
        getIdentifier() {
            return `RecoverThirst:${this.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering thirst";
        }
        async execute(context) {
            const thirstStat = context.player.stat.get(IStats_1.Stat.Thirst);
            const objectivePipelines = [];
            if (!this.exceededThreshold) {
                if (!this.onlyUseAvailableItems) {
                    if (Base_1.baseUtilities.isNearBase(context)) {
                        for (const waterStill of context.base.waterStill) {
                            if (Doodad_1.doodadUtilities.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
                                this.log.info("Near base, going to drink from water still");
                                objectivePipelines.push([
                                    new MoveToTarget_1.default(waterStill, true),
                                    new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                        action.execute(context.player);
                                    }),
                                ]);
                            }
                        }
                        if (context.inventory.waterContainer !== undefined) {
                            for (const waterContainer of context.inventory.waterContainer) {
                                if (Item_1.itemUtilities.isDrinkableItem(waterContainer) && !Item_1.itemUtilities.isSafeToDrinkItem(waterContainer)) {
                                    objectivePipelines.push([new GatherWaterWithRecipe_1.default(waterContainer)]);
                                }
                            }
                        }
                    }
                }
                return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = this.allowEmergencies && thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !Doodad_1.doodadUtilities.isWaterStillDrinkable(waterStill));
            if (context.inventory.waterContainer !== undefined) {
                for (const waterContainer of context.inventory.waterContainer) {
                    if (Item_1.itemUtilities.canGatherWater(waterContainer)) {
                        objectivePipelines.push([new GatherWaterWithRecipe_1.default(waterContainer)]);
                    }
                    else if (Item_1.itemUtilities.isDrinkableItem(waterContainer)) {
                        if (Item_1.itemUtilities.isSafeToDrinkItem(waterContainer)) {
                            this.log.info("Drink water from container");
                            objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, waterContainer)]);
                        }
                        else {
                            if (isEmergency && itemManager.isInGroup(waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
                                this.log.info("Drink unpurified water from container");
                                objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, waterContainer)]);
                            }
                            else {
                                objectivePipelines.push([new GatherWaterWithRecipe_1.default(waterContainer)]);
                            }
                        }
                    }
                }
            }
            if (this.onlyUseAvailableItems) {
                return objectivePipelines.length > 0 ? objectivePipelines : IObjective_1.ObjectiveResult.Ignore;
            }
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if ((isEmergency && health.value > 4) || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
                const nearestFreshWater = await Tile_1.tileUtilities.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
                for (const { point } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(!isEmergency ? 500 : 0));
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                        action.execute(context.player);
                    }));
                    objectivePipelines.push(objectives);
                }
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
                const isWaitingForAll = context.base.waterStill.every(doodad => Doodad_1.doodadUtilities.isWaterStillDesalinating(doodad));
                if (isWaitingForAll) {
                    if (isEmergency) {
                        if ((health.value / health.max) <= 0.3) {
                            this.log.info("Making health items");
                            for (const waterStill of context.base.waterStill) {
                                objectivePipelines.push([
                                    new StartWaterStillDesalination_1.default(waterStill),
                                    new AcquireItemForAction_1.default(IAction_1.ActionType.Heal),
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
                    else if (context.base.waterStill.length < 3 && Player_1.playerUtilities.isHealthy(context)) {
                        this.log.info("Building another water still while waiting");
                        objectivePipelines.push([
                            new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitWaterStill),
                            new BuildItem_1.default(),
                            new AnalyzeBase_1.default(),
                        ]);
                    }
                }
                else {
                    for (const waterStill of context.base.waterStill) {
                        if (Doodad_1.doodadUtilities.isWaterStillDesalinating(waterStill)) {
                            continue;
                        }
                        const waterStillObjectives = [];
                        const isWaterDrinkable = Doodad_1.doodadUtilities.isWaterStillDrinkable(waterStill);
                        const isEmergency = this.allowEmergencies && thirstStat.value <= 3 && !isWaterDrinkable;
                        if (isWaterDrinkable) {
                            waterStillObjectives.push(new MoveToTarget_1.default(waterStill, true));
                            waterStillObjectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                action.execute(context.player);
                            }));
                        }
                        else {
                            waterStillObjectives.push(new StartWaterStillDesalination_1.default(waterStill));
                            if (isEmergency) {
                                const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
                                if ((stamina.value / stamina.max) < 0.9) {
                                    waterStillObjectives.push(new RecoverStamina_1.default());
                                }
                                else {
                                    waterStillObjectives.push(new Idle_1.default().setStatus("Waiting for water still due to emergency"));
                                }
                            }
                        }
                        objectivePipelines.push(waterStillObjectives);
                    }
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUE0QkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLHFCQUE4QixFQUFVLGlCQUEwQixFQUFVLG1CQUFtQixLQUFLO1lBQ2hJLEtBQUssRUFBRSxDQUFDO1lBRG9CLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztZQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtRQUVqSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsRSxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtvQkFFaEMsSUFBSSxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDdEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTs0QkFFakQsSUFBSSx3QkFBZSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFO2dDQUNu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
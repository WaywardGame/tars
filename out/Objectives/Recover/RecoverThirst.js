define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/item/IItem", "../../IObjective", "../../navigation//INavigation", "../../Objective", "../acquire/item/AcquireItemByGroup", "../acquire/item/AcquireItemForAction", "../acquire/item/specific/AcquireWaterContainer", "../analyze/AnalyzeBase", "../core/ExecuteAction", "../core/MoveToTarget", "../other/item/BuildItem", "../other/Idle", "../other/doodad/StartWaterStillDesalination", "../other/item/UseItem", "./RecoverStamina", "../../utilities/Tile", "../../utilities/Base", "../../utilities/Doodad", "../../utilities/Player", "../../utilities/Item", "../gather/GatherWaterWithRecipe"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireWaterContainer_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, RecoverStamina_1, Tile_1, Base_1, Doodad_1, Player_1, Item_1, GatherWaterWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        constructor(onlyUseAvailableItems, exceededThreshold) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
            this.exceededThreshold = exceededThreshold;
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
            const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !Doodad_1.doodadUtilities.isWaterStillDrinkable(waterStill));
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
                                    new Idle_1.default(),
                                ]);
                            }
                        }
                    }
                    else if (context.base.waterStill.length < 3 && Player_1.playerUtilities.isHealthy(context)) {
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
                        if (Doodad_1.doodadUtilities.isWaterStillDesalinating(waterStill)) {
                            continue;
                        }
                        const waterStillObjectives = [];
                        const isWaterDrinkable = Doodad_1.doodadUtilities.isWaterStillDrinkable(waterStill);
                        const isEmergency = thirstStat.value <= 3 && !isWaterDrinkable;
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
                                    waterStillObjectives.push(new Idle_1.default());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUEyQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLHFCQUE4QixFQUFVLGlCQUEwQjtZQUM5RixLQUFLLEVBQUUsQ0FBQztZQURvQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQVM7WUFBVSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFFL0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLG1CQUFtQixDQUFDO1FBQzVCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbEUsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7b0JBRWhDLElBQUksb0JBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3RDLEtBQUssTUFBTSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7NEJBRWpELElBQUksd0JBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQ0FDbkcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FB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
define(["require", "exports", "entity/action/IAction", "entity/IStats", "item/IItem", "../../IObjective", "../../Navigation/INavigation", "../../Objective", "../../Utilities/Base", "../../Utilities/Doodad", "../../Utilities/Item", "../../Utilities/Player", "../../Utilities/Tile", "../Acquire/Item/AcquireItemByGroup", "../Acquire/Item/AcquireItemForAction", "../Acquire/Item/Specific/AcquireWaterContainer", "../Analyze/AnalyzeBase", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/BuildItem", "../Other/Idle", "../Other/StartWaterStillDesalination", "../Other/UseItem", "./RecoverStamina"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, Base_1, Doodad_1, Item_1, Player_1, Tile_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireWaterContainer_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, RecoverStamina_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverThirst extends Objective_1.default {
        constructor(exceededThreshold) {
            super();
            this.exceededThreshold = exceededThreshold;
        }
        getIdentifier() {
            return "RecoverThirst";
        }
        async execute(context) {
            const thirstStat = context.player.stat.get(IStats_1.Stat.Thirst);
            if (!this.exceededThreshold) {
                if (Base_1.isNearBase(context)) {
                    for (const waterStill of context.base.waterStill) {
                        if (Doodad_1.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
                            this.log.info("Near base, going to drink from water still");
                            return [
                                new MoveToTarget_1.default(waterStill, true),
                                new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                                    action.execute(context.player);
                                }),
                            ];
                        }
                    }
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !Doodad_1.isWaterStillDrinkable(waterStill));
            const objectivePipelines = [];
            if (context.inventory.waterContainer !== undefined) {
                for (const waterContainer of context.inventory.waterContainer) {
                    if (Item_1.isDrinkableItem(waterContainer)) {
                        if (Item_1.isSafeToDrinkItem(waterContainer)) {
                            this.log.info("Drink water from container");
                            objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, waterContainer)]);
                        }
                        else if (isEmergency && itemManager.isInGroup(waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
                            this.log.info("Drink unpurified water from container");
                            objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, waterContainer)]);
                        }
                    }
                }
            }
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if (isEmergency || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
                const nearestFreshWater = await Tile_1.getNearestTileLocation(context, INavigation_1.freshWaterTileLocation);
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
                const isWaitingForAll = context.base.waterStill.every(Doodad_1.isWaterStillDesalinating);
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
                    else if (context.base.waterStill.length < 3 && Player_1.isHealthy(context)) {
                        this.log.info("Building another water still while waiting");
                        objectivePipelines.push([
                            new AcquireWaterContainer_1.default(),
                            new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill),
                            new BuildItem_1.default(),
                            new AnalyzeBase_1.default(),
                        ]);
                    }
                }
                else {
                    for (const waterStill of context.base.waterStill) {
                        if (Doodad_1.isWaterStillDesalinating(waterStill)) {
                            continue;
                        }
                        const waterStillObjectives = [];
                        const isWaterDrinkable = Doodad_1.isWaterStillDrinkable(waterStill);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUEwQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLGlCQUEwQjtZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFFdkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3hCLEtBQUssTUFBTSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBRWpELElBQUksOEJBQXFCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUU7NEJBQ25GLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7NEJBRTVELE9BQU87Z0NBQ04sSUFBSSxzQkFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7Z0NBQ2xDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQ0FDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ2hDLENBQUMsQ0FBQzs2QkFD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
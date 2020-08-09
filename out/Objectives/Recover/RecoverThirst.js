define(["require", "exports", "entity/action/IAction", "entity/IStats", "item/IItem", "../../IObjective", "../../Navigation/INavigation", "../../Objective", "../../Utilities/Base", "../../Utilities/Doodad", "../../Utilities/Item", "../../Utilities/Player", "../../Utilities/Tile", "../Acquire/Item/AcquireItemByGroup", "../Acquire/Item/Specific/AcquireWaterContainer", "../Analyze/AnalyzeBase", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/BuildItem", "../Other/Idle", "../Other/StartWaterStillDesalination", "../Other/UseItem", "./RecoverStamina"], function (require, exports, IAction_1, IStats_1, IItem_1, IObjective_1, INavigation_1, Objective_1, Base_1, Doodad_1, Item_1, Player_1, Tile_1, AcquireItemByGroup_1, AcquireWaterContainer_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, RecoverStamina_1) {
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
                        if (waterStill !== undefined && waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0 && (thirstStat.max - thirstStat.value) >= 10) {
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
                if (Item_1.canDrinkItem(context.inventory.waterContainer)) {
                    if (itemManager.isInGroup(context.inventory.waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater) ||
                        itemManager.isInGroup(context.inventory.waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater) ||
                        itemManager.isInGroup(context.inventory.waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater)) {
                        this.log.info("Drink water from container");
                        objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, context.inventory.waterContainer)]);
                    }
                    if (isEmergency && itemManager.isInGroup(context.inventory.waterContainer.type, IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
                        this.log.info("Drink unpurified water from container");
                        objectivePipelines.push([new UseItem_1.default(IAction_1.ActionType.DrinkItem, context.inventory.waterContainer)]);
                    }
                }
            }
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if (isEmergency || (health.value / health.max) >= 0.7) {
                const nearestFreshWater = await Tile_1.getNearestTileLocation(INavigation_1.freshWaterTileLocation, context.player);
                for (const { point } of nearestFreshWater) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(point, true).addDifficulty(!isEmergency ? 100 : 0));
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
                    if (context.base.waterStill.length < 3 && Player_1.isHealthy(context)) {
                        objectivePipelines.push([
                            new AcquireWaterContainer_1.default(),
                            new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill),
                            new BuildItem_1.default(),
                            new AnalyzeBase_1.default(),
                        ]);
                    }
                    else {
                        for (const waterStill of context.base.waterStill) {
                            objectivePipelines.push([
                                new MoveToTarget_1.default(waterStill, true, { range: 5 }),
                                new Idle_1.default(),
                            ]);
                        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF5QkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLGlCQUEwQjtZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFFdkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3hCLEtBQUssTUFBTSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBRWpELElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRTs0QkFDakosSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQzs0QkFFNUQsT0FBTztnQ0FDTixJQUFJLHNCQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztnQ0FDbEMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29DQUM5RCxNQUFNLENBQUMsT0FB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
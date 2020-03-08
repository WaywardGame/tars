define(["require", "exports", "entity/action/IAction", "entity/IStats", "game/IGame", "item/IItem", "../../IObjective", "../../Navigation/INavigation", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../../Utilities/Tile", "../Acquire/Item/Specific/AcquireWaterContainer", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/BuildItem", "../Other/Idle", "../Other/StartWaterStillDesalination", "../Other/UseItem", "./RecoverStamina"], function (require, exports, IAction_1, IStats_1, IGame_1, IItem_1, IObjective_1, INavigation_1, Objective_1, Base_1, Item_1, Tile_1, AcquireWaterContainer_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1, Idle_1, StartWaterStillDesalination_1, UseItem_1, RecoverStamina_1) {
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
            const thirst = context.player.stat.get(IStats_1.Stat.Thirst);
            const waterStill = context.base.waterStill[0];
            if (!this.exceededThreshold) {
                if (Base_1.isNearBase(context) && waterStill !== undefined && waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0 && (thirst.max - thirst.value) >= 10) {
                    this.log.info("Near base, going to drink from water still");
                    return [
                        new MoveToTarget_1.default(waterStill, true),
                        new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                            action.execute(context.player);
                        }),
                    ];
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = thirst.value <= 3 && (!waterStill || waterStill.gatherReady === undefined || (waterStill.gatherReady !== undefined && waterStill.gatherReady > 0));
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
            const waterStillObjectives = [];
            if (waterStill !== undefined) {
                const isEmergency = context.player.stat.get(IStats_1.Stat.Thirst).value <= 3 && (!waterStill || waterStill.gatherReady === undefined || (waterStill.gatherReady !== undefined && waterStill.gatherReady > 0));
                if (waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0) {
                    waterStillObjectives.push(new MoveToTarget_1.default(waterStill, true));
                    waterStillObjectives.push(new ExecuteAction_1.default(IAction_1.ActionType.DrinkInFront, (context, action) => {
                        action.execute(context.player);
                    }));
                }
                else {
                    waterStillObjectives.push(new StartWaterStillDesalination_1.default(waterStill));
                    if (isEmergency) {
                        waterStillObjectives.push(new MoveToTarget_1.default(waterStill, true));
                        const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
                        if ((stamina.value / stamina.max) < 0.9) {
                            waterStillObjectives.push(new RecoverStamina_1.default());
                        }
                        else if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                            waterStillObjectives.push(new Idle_1.default());
                        }
                    }
                }
            }
            else {
                if (context.inventory.waterStill !== undefined) {
                    waterStillObjectives.push(new BuildItem_1.default(context.inventory.waterStill));
                }
                if (context.inventory.waterContainer === undefined) {
                    waterStillObjectives.push(new AcquireWaterContainer_1.default());
                }
            }
            objectivePipelines.push(waterStillObjectives);
            return objectivePipelines;
        }
    }
    exports.default = RecoverThirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLGlCQUEwQjtZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFFdkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDaEssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztvQkFFNUQsT0FBTzt3QkFDTixJQUFJLHNCQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQzt3QkFDbEMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUM5RCxNQUFNLENBQUMsT0FBTyxD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
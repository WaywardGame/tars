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
                if (Base_1.isNearBase(context) && waterStill !== undefined && waterStill.gatherReady && (thirst.max - thirst.value) >= 10) {
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
            const isEmergency = thirst.value <= 3 && (!waterStill || !waterStill.gatherReady);
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
                const isEmergency = context.player.stat.get(IStats_1.Stat.Thirst).value <= 3 && (!waterStill || !waterStill.gatherReady);
                if (waterStill.gatherReady) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclRoaXJzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3ZlclRoaXJzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLGlCQUEwQjtZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVM7UUFFdkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFO29CQUNuSCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO29CQUU1RCxPQUFPO3dCQUNOLElBQUksc0JBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO3dCQUNsQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQzlELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoQyxDQUFD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
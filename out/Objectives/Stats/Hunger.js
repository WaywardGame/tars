define(["require", "exports", "Enums", "../../Helpers", "../../IObjective", "../../ITars", "../../Objective", "../GatherWater", "../PlantSeed", "../UseItem"], function (require, exports, Enums_1, Helpers, IObjective_1, ITars_1, Objective_1, GatherWater_1, PlantSeed_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Hunger extends Objective_1.default {
        onExecute(base, inventory) {
            const food = itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Food, true);
            if (food.length !== 0) {
                this.log(`Eating ${Enums_1.ItemType[food[0].type]}`);
                return new UseItem_1.default(food[0], Enums_1.ActionType.Eat);
            }
            const plantToGather = Helpers.findAndMoveToTarget((point, tile) => {
                if (tile.doodad === undefined || !tile.doodad.isReadyToGather()) {
                    return false;
                }
                const description = tile.doodad.description();
                if (!description || description.isTree) {
                    return false;
                }
                const growingStage = tile.doodad.getGrowingStage();
                return growingStage !== undefined && growingStage >= Enums_1.GrowingStage.Ripening;
            }, false, ITars_1.gardenMaxTilesChecked);
            if (plantToGather !== ITars_1.MoveResult.NoTarget) {
                if (plantToGather === ITars_1.MoveResult.Complete) {
                    if (Helpers.ensureHandsEquipment(Enums_1.ActionType.Gather)) {
                        return;
                    }
                    this.log("Gathering plant");
                    actionManager.execute(localPlayer, Enums_1.ActionType.Gather, {});
                }
                return;
            }
            const seeds = Helpers.getSeeds();
            if (seeds.length > 0) {
                this.log("Plant seed");
                return new PlantSeed_1.default(seeds[0]);
            }
            const plantToWater = Helpers.findTarget((point, tile) => {
                if (tile.doodad === undefined) {
                    return false;
                }
                const description = tile.doodad.description();
                if (!description || description.isTree) {
                    return false;
                }
                const growingStage = tile.doodad.getGrowingStage();
                return growingStage !== undefined && growingStage < Enums_1.GrowingStage.Ripening;
            }, ITars_1.gardenMaxTilesChecked);
            if (plantToWater === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (inventory.waterContainer === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            const waterContainerDescription = inventory.waterContainer.description();
            const isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1;
            if (isWaterInContainer) {
                const moveResult = Helpers.moveToTarget(plantToWater, false);
                if (moveResult === ITars_1.MoveResult.Complete) {
                    this.log("Pour water on plant");
                    return new UseItem_1.default(inventory.waterContainer, Enums_1.ActionType.Pour);
                }
            }
            this.log("Gather water from a water tile");
            return new GatherWater_1.default(inventory.waterContainer);
        }
    }
    exports.default = Hunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVuZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvU3RhdHMvSHVuZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLFlBQTRCLFNBQVEsbUJBQVM7UUFFckMsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUN2RCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxxQkFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxnQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQWMsRUFBRSxJQUFXO2dCQUM3RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNkLENBQUM7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxN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
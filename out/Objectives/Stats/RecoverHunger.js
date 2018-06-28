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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1N0YXRzL1JlY292ZXJIdW5nZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsWUFBNEIsU0FBUSxtQkFBUztRQUVyQyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLHFCQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLGdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBRUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBYyxFQUFFLElBQVc7Z0JBQzdFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFD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
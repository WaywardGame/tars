define(["require", "exports", "Enums", "item/Items", "Utilities", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./ExecuteAction", "./PlantSeed", "./UseItem"], function (require, exports, Enums_1, Items_1, Utilities, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItem_1, ExecuteAction_1, PlantSeed_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHunger extends Objective_1.default {
        onExecute(base, inventory) {
            const isImportant = localPlayer.stats.hunger.value <= 3;
            const isEmergency = localPlayer.stats.hunger.value < 0;
            let food = itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Food, true);
            if (isEmergency && food.length === 0) {
                food = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Eat);
            }
            if (food.length > 0) {
                this.log(`Eating ${Enums_1.ItemType[food[0].type]}`);
                return new UseItem_1.default(food[0], Enums_1.ActionType.Eat);
            }
            const plantToGather = Helpers.findAndMoveToTarget((point, tile) => {
                if (tile.doodad === undefined || !tile.doodad.isReadyToGather()) {
                    return false;
                }
                const description = tile.doodad.description();
                if (!description || description.isTree || description.gather === undefined) {
                    return false;
                }
                const growingStage = tile.doodad.getGrowingStage();
                if (growingStage === undefined) {
                    return false;
                }
                if (isImportant) {
                    const gatherItems = description.gather[growingStage];
                    for (const gatherItem of gatherItems) {
                        const itemDescription = Items_1.itemDescriptions[gatherItem.type];
                        if (itemDescription && itemDescription.group !== undefined && itemDescription.group.indexOf(Enums_1.ItemTypeGroup.Food) !== -1) {
                            return true;
                        }
                    }
                }
                if (isEmergency) {
                    const gatherItems = description.gather[growingStage];
                    for (const gatherItem of gatherItems) {
                        const itemDescription = Items_1.itemDescriptions[gatherItem.type];
                        if (itemDescription && itemDescription.use !== undefined && itemDescription.use.indexOf(Enums_1.ActionType.Eat) !== -1) {
                            return true;
                        }
                    }
                }
                return growingStage !== undefined && growingStage >= Enums_1.GrowingStage.Ripening;
            }, false, ITars_1.gardenMaxTilesChecked);
            if (plantToGather !== ITars_1.MoveResult.NoTarget) {
                if (plantToGather === ITars_1.MoveResult.Complete) {
                    this.log("Gathering plant");
                    return new ExecuteAction_1.default(Enums_1.ActionType.Gather, {
                        item: Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Gather)[0]
                    });
                }
                return;
            }
            const seeds = Helpers.getSeeds();
            if (seeds.length > 0) {
                this.log("Plant seed");
                return new PlantSeed_1.default(seeds[0]);
            }
            const objectiveSets = [];
            for (const itemType of Utilities.Enums.getValues(Enums_1.ItemType)) {
                const description = Items_1.itemDescriptions[itemType];
                if (!description || description.craftable === false || !description.use || description.use.indexOf(Enums_1.ActionType.Eat) === -1) {
                    continue;
                }
                const recipe = description.recipe;
                if (!recipe) {
                    continue;
                }
                objectiveSets.push([new AcquireItem_1.default(itemType)]);
            }
            const objective = this.pickEasiestObjective(base, inventory, objectiveSets);
            if (objective === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            return objective;
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdHMvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxtQkFBbUMsU0FBUSxtQkFBUztRQUU1QyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDeEQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUV2RCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxxQkFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRyxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLGdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBRUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBYyxFQUFFLElBQVcs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
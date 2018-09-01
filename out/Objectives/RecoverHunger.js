var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "item/Items", "utilities/enum/Enums", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./ExecuteAction", "./PlantSeed", "./UseItem", "../Utilities/Item", "../Utilities/Movement"], function (require, exports, IStats_1, Enums_1, Items_1, Enums_2, IObjective_1, ITars_1, Objective_1, AcquireItem_1, ExecuteAction_1, PlantSeed_1, UseItem_1, Item_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHunger extends Objective_1.default {
        getHashCode() {
            return "RecoverHunger";
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const hungerValue = localPlayer.getStat(IStats_1.Stat.Hunger).value;
                const isImportant = hungerValue <= 3;
                const isEmergency = hungerValue < 0;
                let food = itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Food, true);
                if (isEmergency && food.length === 0) {
                    food = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Eat);
                }
                if (food.length > 0) {
                    this.log.info(`Eating ${game.getName(food[0], Enums_1.SentenceCaseStyle.Title, false)}`);
                    return new UseItem_1.default(food[0], Enums_1.ActionType.Eat);
                }
                let objectiveSets = [];
                for (const itemType of Enums_2.default.values(Enums_1.ItemType)) {
                    const description = Items_1.itemDescriptions[itemType];
                    if (!description || description.craftable === false || !description.use || description.use.indexOf(Enums_1.ActionType.Eat) === -1) {
                        continue;
                    }
                    const recipe = description.recipe;
                    if (!recipe) {
                        continue;
                    }
                    const checker = Item_1.processRecipe(inventory, recipe, true);
                    if (checker.requirementsMet()) {
                        objectiveSets.push([new AcquireItem_1.default(itemType)]);
                    }
                }
                let objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (objective !== undefined) {
                    return objective;
                }
                const plantToGather = yield Movement_1.findAndMoveToFaceTarget((point, tile) => {
                    if (tile.doodad === undefined || !tile.doodad.canGather()) {
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
                        if (gatherItems) {
                            for (const gatherItem of gatherItems) {
                                const itemDescription = Items_1.itemDescriptions[gatherItem.type];
                                if (itemDescription && itemDescription.group !== undefined && itemDescription.group.indexOf(Enums_1.ItemTypeGroup.Food) !== -1) {
                                    return true;
                                }
                            }
                        }
                    }
                    if (isEmergency) {
                        const gatherItems = description.gather[growingStage];
                        if (gatherItems) {
                            for (const gatherItem of gatherItems) {
                                const itemDescription = Items_1.itemDescriptions[gatherItem.type];
                                if (itemDescription && itemDescription.use !== undefined && itemDescription.use.indexOf(Enums_1.ActionType.Eat) !== -1) {
                                    return true;
                                }
                            }
                        }
                    }
                    return growingStage !== undefined && growingStage >= Enums_1.GrowingStage.Ripening;
                }, ITars_1.gardenMaxTilesChecked);
                if (plantToGather !== Movement_1.MoveResult.NoTarget) {
                    if (plantToGather === Movement_1.MoveResult.Complete) {
                        this.log.info("Gathering plant");
                        return new ExecuteAction_1.default(Enums_1.ActionType.Gather, {
                            item: Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Gather)[0]
                        });
                    }
                    return;
                }
                const seeds = Item_1.getSeeds();
                if (seeds.length > 0) {
                    this.log.info("Plant seed");
                    return new PlantSeed_1.default(seeds[0]);
                }
                objectiveSets = [];
                for (const itemType of Enums_2.default.values(Enums_1.ItemType)) {
                    const description = Items_1.itemDescriptions[itemType];
                    if (!description || description.craftable === false || !description.group || description.group.indexOf(Enums_1.ItemTypeGroup.Food) === -1) {
                        continue;
                    }
                    objectiveSets.push([new AcquireItem_1.default(itemType)]);
                }
                objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (objective !== undefined) {
                    return objective;
                }
                if (!isImportant) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                objectiveSets = [];
                for (const itemType of Enums_2.default.values(Enums_1.ItemType)) {
                    const description = Items_1.itemDescriptions[itemType];
                    if (!description || description.craftable === false || !description.use || description.use.indexOf(Enums_1.ActionType.Eat) === -1) {
                        continue;
                    }
                    objectiveSets.push([new AcquireItem_1.default(itemType)]);
                }
                objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (objective !== undefined) {
                    return objective;
                }
                return IObjective_1.ObjectiveStatus.Complete;
            });
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJIdW5nZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFnQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRTVDLFdBQVc7WUFDakIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2xFLE1BQU0sV0FBVyxHQUFHLFdBQVcsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBRXBDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLHFCQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDckMsSUFBSSxHQUFHLCtCQUF3QixDQUFDLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hEO2dCQUVELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakYsT0FBTyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzVDO2dCQUdELElBQUksYUFBYSxHQUFt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
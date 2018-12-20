var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "entity/IStats", "Enums", "item/Items", "utilities/enum/Enums", "../IObjective", "../ITars", "../Objective", "../Utilities/Item", "../Utilities/Movement", "./AcquireItem", "./ExecuteAction", "./PlantSeed", "./UseItem"], function (require, exports, IAction_1, IStats_1, Enums_1, Items_1, Enums_2, IObjective_1, ITars_1, Objective_1, Item_1, Movement_1, AcquireItem_1, ExecuteAction_1, PlantSeed_1, UseItem_1) {
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
                    food = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Eat);
                }
                if (food.length > 0) {
                    this.log.info(`Eating ${food[0].getName(false).getString()}`);
                    return new UseItem_1.default(food[0], IAction_1.ActionType.Eat);
                }
                let objectiveSets = [];
                for (const itemType of Enums_2.default.values(Enums_1.ItemType)) {
                    const description = Items_1.itemDescriptions[itemType];
                    if (!description || description.craftable === false || !description.use || description.use.indexOf(IAction_1.ActionType.Eat) === -1) {
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
                                if (itemManager.isInGroup(gatherItem.type, Enums_1.ItemTypeGroup.Food)) {
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
                                if (itemDescription && itemDescription.use !== undefined && itemDescription.use.indexOf(IAction_1.ActionType.Eat) !== -1) {
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
                        return new ExecuteAction_1.default(IAction_1.ActionType.Gather, action => action.execute(localPlayer, Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Gather)[0]));
                    }
                    return;
                }
                const seeds = Item_1.getSeeds();
                if (seeds.length > 0) {
                    this.log.info("Plant seed");
                    return new PlantSeed_1.default(seeds[0]);
                }
                objectiveSets = [];
                const craftableFoodItems = itemManager.getGroupItems(Enums_1.ItemTypeGroup.Food);
                for (const itemType of craftableFoodItems) {
                    const description = Items_1.itemDescriptions[itemType];
                    if (!description || description.craftable === false) {
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
                    if (!description || description.craftable === false || !description.use || description.use.indexOf(IAction_1.ActionType.Eat) === -1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJIdW5nZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFpQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRTVDLFdBQVc7WUFDakIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2xFLE1BQU0sV0FBVyxHQUFHLFdBQVcsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBRXBDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLHFCQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDckMsSUFBSSxHQUFHLCtCQUF3QixDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hEO2dCQUVELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzlELE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QztnQkFHRCxJQUFJLGFBQWEsR0FBbUIsRUFBRSxDQUFDO2dCQUV2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
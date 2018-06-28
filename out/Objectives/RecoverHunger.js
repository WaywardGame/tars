var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "item/Items", "utilities/enum/Enums", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./ExecuteAction", "./PlantSeed", "./UseItem"], function (require, exports, IStats_1, Enums_1, Items_1, Enums_2, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItem_1, ExecuteAction_1, PlantSeed_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHunger extends Objective_1.default {
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const hungerValue = localPlayer.getStat(IStats_1.Stat.Hunger).value;
                const isImportant = hungerValue <= 3;
                const isEmergency = hungerValue < 0;
                let food = itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Food, true);
                if (isEmergency && food.length === 0) {
                    food = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Eat);
                }
                if (food.length > 0) {
                    this.log.info(`Eating ${Enums_1.ItemType[food[0].type]}`);
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
                    const checker = Helpers.processRecipe(inventory, recipe, true);
                    if (checker.requirementsMet()) {
                        objectiveSets.push([new AcquireItem_1.default(itemType)]);
                    }
                }
                let objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (objective !== undefined) {
                    return objective;
                }
                const plantToGather = yield Helpers.findAndMoveToTarget((point, tile) => {
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
                }, false, ITars_1.gardenMaxTilesChecked);
                if (plantToGather !== ITars_1.MoveResult.NoTarget) {
                    if (plantToGather === ITars_1.MoveResult.Complete) {
                        this.log.info("Gathering plant");
                        return new ExecuteAction_1.default(Enums_1.ActionType.Gather, {
                            item: Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Gather)[0]
                        });
                    }
                    return;
                }
                const seeds = Helpers.getSeeds();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJIdW5nZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFlQSxtQkFBbUMsU0FBUSxtQkFBUztRQUV0QyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNsRSxNQUFNLFdBQVcsR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLFdBQVcsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUVwQyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxxQkFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3JDLElBQUksR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsa0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDeEQ7Z0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxnQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xELE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxrQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QztnQkFHRCxJQUFJLGFBQWEsR0FBbUIsRUFBRSxDQUFDO2dCQUV2QyxLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUM5QyxNQUFNLFdBQVcsR0FBRyx3QkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMxSCxTQUFTO3FCQUNUO29CQUVELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osU0FBUztxQkFDVDtvQkFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQy9ELElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFO3dCQUM5QixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0Q7Z0JBRUQsSUFBSSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO29CQUM1QixPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBR0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUU7b0JBQ3hGLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO3dCQUMxRCxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUM5QyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7d0JBQzNFLE9BQU8sS0FBSyxDQUFDO3FCQUNiO29CQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ25ELElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTt3QkFDL0IsT0FBTyxLQUFLLENBQUM7cUJBQ2I7b0JBRUQsSUFBSSxXQUFXLEVBQUU7d0JBRWhCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ3JELElBQUksV0FBVyxFQUFFOzRCQUNoQixLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtnQ0FDckMsTUFBTSxlQUFlLEdBQUcsd0JBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQy9DLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0NBQ3ZILE9BQU8sSUFBSSxDQUFDO2lDQUNaOzZCQUNEO3lCQUNEO3FCQUNEO29CQUVELElBQUksV0FBVyxFQUFFO3dCQUVoQixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLFdBQVcsRUFBRTs0QkFDaEIsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7Z0NBQ3JDLE1BQU0sZUFBZSxHQUFHLHdCQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUMvQyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29DQUMvRyxPQUFPLElBQUksQ0FBQztpQ0FDWjs2QkFDRDt5QkFDRDtxQkFDRDtvQkFHRCxPQUFPLFlBQVksS0FBSyxTQUFTLElBQUksWUFBWSxJQUFJLG9CQUFZLENBQUMsUUFBUSxDQUFDO2dCQUU1RSxDQUFDLEVBQUUsS0FBSyxFQUFFLDZCQUFxQixDQUFDLENBQUM7Z0JBRWpDLElBQUksYUFBYSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO29CQUMxQyxJQUFJLGFBQWEsS0FBSyxrQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzt3QkFFakMsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxNQUFNLEVBQUU7NEJBQzNDLElBQUksRUFBRSxPQUFPLENBQUMsd0JBQXdCLENBQUMsa0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQzVELENBQUMsQ0FBQztxQkFDSDtvQkFFRCxPQUFPO2lCQUNQO2dCQUdELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzVCLE9BQU8sSUFBSSxtQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvQjtnQkFHRCxhQUFhLEdBQUcsRUFBRSxDQUFDO2dCQUVuQixLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUM5QyxNQUFNLFdBQVcsR0FBRyx3QkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUNsSSxTQUFTO3FCQUNUO29CQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoRDtnQkFFRCxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO29CQUM1QixPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDakIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBR0QsYUFBYSxHQUFHLEVBQUUsQ0FBQztnQkFFbkIsS0FBSyxNQUFNLFFBQVEsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFRLENBQUMsRUFBRTtvQkFDOUMsTUFBTSxXQUFXLEdBQUcsd0JBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDMUgsU0FBUztxQkFDVDtvQkFFRCxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEQ7Z0JBRUQsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQzVFLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsT0FBTyxTQUFTLENBQUM7aUJBQ2pCO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFzQ2pDLENBQUM7U0FBQTtLQUVEO0lBMUxELGdDQTBMQyJ9
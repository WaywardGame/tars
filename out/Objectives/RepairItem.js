var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItem", "./ExecuteAction"], function (require, exports, Enums_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItem_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RepairItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getHashCode() {
            return `RepairItem:${game.getName(this.item, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (inventory.hammer === undefined) {
                    return new AcquireItem_1.default(Enums_1.ItemType.StoneHammer);
                }
                const description = this.item.description();
                if (!description) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const requirements = itemManager.hasAdditionalRequirements(localPlayer, this.item.type);
                if (!requirements.requirementsMet) {
                    const recipe = description.recipe;
                    if (recipe) {
                        if (recipe.requiresFire) {
                            this.log.info("Recipe requires fire");
                            return new AcquireBuildMoveToFire_1.default();
                        }
                        if (recipe.requiredDoodad !== undefined) {
                            this.log.info("Recipe requires doodad");
                            return new AcquireBuildMoveToDoodad_1.default(recipe.requiredDoodad);
                        }
                        if (calculateDifficulty) {
                            return IObjective_1.missionImpossible;
                        }
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.Repair, {
                    item: inventory.hammer,
                    repairee: this.item
                });
            });
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlcGFpckl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxnQkFBZ0MsU0FBUSxtQkFBUztRQUVoRCxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGNBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2hGLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDbkMsT0FBTyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDN0M7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDakIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4RixJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRTtvQkFDbEMsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztvQkFDbEMsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFOzRCQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUN0QyxPQUFPLElBQUksZ0NBQXNCLEVBQUUsQ0FBQzt5QkFDcEM7d0JBRUQsSUFBSSxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTs0QkFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs0QkFDeEMsT0FBTyxJQUFJLGtDQUF3QixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDM0Q7d0JBRUQsSUFBSSxtQkFBbUIsRUFBRTs0QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQzt5QkFDekI7cUJBQ0Q7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQzNDLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtvQkFDdEIsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJO2lCQUNuQixDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FFRDtJQWhERCw2QkFnREMifQ==
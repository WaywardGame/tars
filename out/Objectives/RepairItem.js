var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "../IObjective", "../Objective", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItem", "./ExecuteAction"], function (require, exports, IAction_1, Enums_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItem_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RepairItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getHashCode() {
            return `RepairItem:${this.item && this.item.getName(false).getString()}`;
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
                    this.log.info("Requirements not met?");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.Repair, action => action.execute(localPlayer, inventory.hammer, this.item));
            });
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlcGFpckl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFXQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFaEQsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDMUUsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUNuQyxPQUFPLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUM3QztnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hGLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFO29CQUNsQyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO29CQUNsQyxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7NEJBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7NEJBQ3RDLE9BQU8sSUFBSSxnQ0FBc0IsRUFBRSxDQUFDO3lCQUNwQzt3QkFFRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFOzRCQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDOzRCQUN4QyxPQUFPLElBQUksa0NBQXdCLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3lCQUMzRDt3QkFFRCxJQUFJLG1CQUFtQixFQUFFOzRCQUN4QixPQUFPLDhCQUFpQixDQUFDO3lCQUN6QjtxQkFDRDtvQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUV2QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxNQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEgsQ0FBQztTQUFBO0tBRUQ7SUEvQ0QsNkJBK0NDIn0=
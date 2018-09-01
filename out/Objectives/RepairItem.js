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
                    this.log.info("Requirements not met?");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlcGFpckl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFaEQsWUFBb0IsSUFBVztZQUM5QixLQUFLLEVBQUUsQ0FBQztZQURXLFNBQUksR0FBSixJQUFJLENBQU87UUFFL0IsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxjQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx5QkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNoRixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ25DLE9BQU8sSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzdDO2dCQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEYsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUU7b0JBQ2xDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7b0JBQ2xDLElBQUksTUFBTSxFQUFFO3dCQUNYLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTs0QkFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs0QkFDdEMsT0FBTyxJQUFJLGdDQUFzQixFQUFFLENBQUM7eUJBQ3BDO3dCQUVELElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7NEJBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7NEJBQ3hDLE9BQU8sSUFBSSxrQ0FBd0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7eUJBQzNEO3dCQUVELElBQUksbUJBQW1CLEVBQUU7NEJBQ3hCLE9BQU8sOEJBQWlCLENBQUM7eUJBQ3pCO3FCQUNEO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBRXZDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsTUFBTSxFQUFFO29CQUMzQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU07b0JBQ3RCLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSTtpQkFDbkIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBRUQ7SUFsREQsNkJBa0RDIn0=
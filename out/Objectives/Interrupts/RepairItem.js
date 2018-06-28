define(["require", "exports", "Enums", "../IObjective", "../Objective", "./AcquireBuildMoveToDoodad", "./AcquireBuildMoveToFire", "./AcquireItem", "./ExecuteAction"], function (require, exports, Enums_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AcquireItem_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RepairItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        onExecute(base, inventory, calculateDifficulty) {
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
                        this.log("Recipe requires fire");
                        return new AcquireBuildMoveToFire_1.default();
                    }
                    if (recipe.requiredDoodad !== undefined) {
                        this.log("Recipe requires doodad");
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
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdHMvUmVwYWlySXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxnQkFBZ0MsU0FBUSxtQkFBUztRQUVoRCxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRU0sU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0QjtZQUNyRixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hGLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ1osRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksZ0NBQXNCLEVBQUUsQ0FBQztvQkFDckMsQ0FBQztvQkFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQzt3QkFDbkMsTUFBTSxDQUFDLElBQUksa0NBQXdCLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUM1RCxDQUFDO29CQUVELEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzt3QkFDekIsTUFBTSxDQUFDLDhCQUFpQixDQUFDO29CQUMxQixDQUFDO2dCQUNGLENBQUM7Z0JBRUQsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsTUFBTSxFQUFFO2dCQUMzQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU07Z0JBQ3RCLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSTthQUNuQixDQUFDLENBQUM7UUFDSixDQUFDO0tBRUQ7SUE1Q0QsNkJBNENDIn0=
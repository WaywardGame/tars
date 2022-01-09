define(["require", "exports", "game/entity/action/IAction", "game/item/Items", "../../../core/context/IContext", "../../../core/objective/Objective", "../../../objectives/contextData/SetContextData", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe"], function (require, exports, IAction_1, Items_1, IContext_1, Objective_1, SetContextData_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireFood extends Objective_1.default {
        constructor(allowDangerousFoodItems = false) {
            super();
            this.allowDangerousFoodItems = allowDangerousFoodItems;
        }
        getIdentifier() {
            return "AcquireFood";
        }
        getStatus() {
            return "Acquiring food";
        }
        async execute(context) {
            const objectivePipelines = [];
            objectivePipelines.push(...AcquireFood.getFoodRecipeObjectivePipelines(context, false));
            for (const itemType of context.utilities.item.foodItemTypes) {
                objectivePipelines.push([
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItem_1.default(itemType).passAcquireData(this),
                ]);
            }
            if (this.allowDangerousFoodItems) {
                objectivePipelines.push([
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItemForAction_1.default(IAction_1.ActionType.Eat).passAcquireData(this).addDifficulty(100),
                ]);
            }
            return objectivePipelines;
        }
        static getFoodRecipeObjectivePipelines(context, eatFood) {
            const objectivePipelines = [];
            for (const itemType of context.utilities.item.foodItemTypes) {
                const description = Items_1.default[itemType];
                if (!description || description.craftable === false) {
                    continue;
                }
                const recipe = description.recipe;
                if (!recipe) {
                    continue;
                }
                const checker = context.utilities.item.processRecipe(context, recipe, true);
                for (const chest of context.base.chest) {
                    checker.processContainer(chest);
                }
                if (checker.requirementsMet()) {
                    const objectives = [
                        new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                        new AcquireItemWithRecipe_1.default(itemType, recipe),
                    ];
                    if (eatFood) {
                        objectives.push(new UseItem_1.default(IAction_1.ActionType.Eat));
                    }
                    objectivePipelines.push(objectives);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = AcquireFood;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLDBCQUFtQyxLQUFLO1lBQ3BFLEtBQUssRUFBRSxDQUFDO1lBRG9CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBaUI7UUFFckUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQzVELGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO29CQUM1RixJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztpQkFDL0MsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFFakMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7b0JBQzVGLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztpQkFDakYsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFTSxNQUFNLENBQUMsK0JBQStCLENBQUMsT0FBZ0IsRUFBRSxPQUFnQjtZQUMvRSxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQzVELE1BQU0sV0FBVyxHQUFHLGVBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7b0JBQ3BELFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixTQUFTO2lCQUNUO2dCQUVELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU1RSxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUN2QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBbUIsQ0FBQyxDQUFDO2lCQUM5QztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRTtvQkFDOUIsTUFBTSxVQUFVLEdBQWlCO3dCQUNoQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7d0JBQzVGLElBQUksK0JBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztxQkFDM0MsQ0FBQztvQkFFRixJQUFJLE9BQU8sRUFBRTt3QkFDWixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQzdDO29CQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDcEM7YUFDRDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBM0VELDhCQTJFQyJ9
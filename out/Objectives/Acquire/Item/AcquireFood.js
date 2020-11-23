define(["require", "exports", "entity/action/IAction", "item/Items", "../../../IContext", "../../../Objective", "../../../Objectives/ContextData/SetContextData", "../../../Objectives/Other/UseItem", "../../../Utilities/Item", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe"], function (require, exports, IAction_1, Items_1, IContext_1, Objective_1, SetContextData_1, UseItem_1, Item_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1) {
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
            for (const itemType of Item_1.foodItemTypes) {
                objectivePipelines.push([
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItem_1.default(itemType).passContextDataKey(this),
                ]);
            }
            if (this.allowDangerousFoodItems) {
                objectivePipelines.push([
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItemForAction_1.default(IAction_1.ActionType.Eat).passContextDataKey(this).addDifficulty(100),
                ]);
            }
            return objectivePipelines;
        }
        static getFoodRecipeObjectivePipelines(context, eatFood) {
            const objectivePipelines = [];
            for (const itemType of Item_1.foodItemTypes) {
                const description = Items_1.default[itemType];
                if (!description || description.craftable === false) {
                    continue;
                }
                const recipe = description.recipe;
                if (!recipe) {
                    continue;
                }
                const checker = Item_1.processRecipe(context, recipe, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QiwwQkFBbUMsS0FBSztZQUNwRSxLQUFLLEVBQUUsQ0FBQztZQURvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWlCO1FBRXJFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLCtCQUErQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXhGLEtBQUssTUFBTSxRQUFRLElBQUksb0JBQWEsRUFBRTtnQkFDckMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7b0JBQzVGLElBQUkscUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7aUJBQ2xELENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBRWpDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO29CQUM1RixJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztpQkFDcEYsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFTSxNQUFNLENBQUMsK0JBQStCLENBQUMsT0FBZ0IsRUFBRSxPQUFnQjtZQUMvRSxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxvQkFBYSxFQUFFO2dCQUNyQyxNQUFNLFdBQVcsR0FBRyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO29CQUNwRCxTQUFTO2lCQUNUO2dCQUVELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osU0FBUztpQkFDVDtnQkFFRCxNQUFNLE9BQU8sR0FBRyxvQkFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXJELEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFtQixDQUFDLENBQUM7aUJBQzlDO2dCQUVELElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFO29CQUM5QixNQUFNLFVBQVUsR0FBaUI7d0JBQ2hDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQzt3QkFDNUYsSUFBSSwrQkFBcUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO3FCQUMzQyxDQUFDO29CQUVGLElBQUksT0FBTyxFQUFFO3dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDN0M7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwQzthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUEzRUQsOEJBMkVDIn0=
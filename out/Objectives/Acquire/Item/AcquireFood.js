define(["require", "exports", "game/entity/action/IAction", "game/item/Items", "../../../IContext", "../../../Objective", "../../../objectives/contextData/SetContextData", "../../../utilities/Item", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe"], function (require, exports, IAction_1, Items_1, IContext_1, Objective_1, SetContextData_1, Item_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1) {
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
            for (const itemType of Item_1.itemUtilities.foodItemTypes) {
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
            for (const itemType of Item_1.itemUtilities.foodItemTypes) {
                const description = Items_1.default[itemType];
                if (!description || description.craftable === false) {
                    continue;
                }
                const recipe = description.recipe;
                if (!recipe) {
                    continue;
                }
                const checker = Item_1.itemUtilities.processRecipe(context, recipe, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QiwwQkFBbUMsS0FBSztZQUNwRSxLQUFLLEVBQUUsQ0FBQztZQURvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWlCO1FBRXJFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLCtCQUErQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXhGLEtBQUssTUFBTSxRQUFRLElBQUksb0JBQWEsQ0FBQyxhQUFhLEVBQUU7Z0JBQ25ELGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO29CQUM1RixJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2lCQUNsRCxDQUFDLENBQUM7YUFDSDtZQUVELElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUVqQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQztvQkFDNUYsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7aUJBQ3BGLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sTUFBTSxDQUFDLCtCQUErQixDQUFDLE9BQWdCLEVBQUUsT0FBZ0I7WUFDL0UsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksb0JBQWEsQ0FBQyxhQUFhLEVBQUU7Z0JBQ25ELE1BQU0sV0FBVyxHQUFHLGVBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7b0JBQ3BELFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixTQUFTO2lCQUNUO2dCQUVELE1BQU0sT0FBTyxHQUFHLG9CQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRW5FLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFtQixDQUFDLENBQUM7aUJBQzlDO2dCQUVELElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFO29CQUM5QixNQUFNLFVBQVUsR0FBaUI7d0JBQ2hDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQzt3QkFDNUYsSUFBSSwrQkFBcUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO3FCQUMzQyxDQUFDO29CQUVGLElBQUksT0FBTyxFQUFFO3dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDN0M7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwQzthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUEzRUQsOEJBMkVDIn0=
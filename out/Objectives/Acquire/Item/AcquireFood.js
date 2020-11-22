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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QiwwQkFBbUMsS0FBSztZQUNwRSxLQUFLLEVBQUUsQ0FBQztZQURvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWlCO1FBRXJFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsS0FBSyxNQUFNLFFBQVEsSUFBSSxvQkFBYSxFQUFFO2dCQUNyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQztvQkFDNUYsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztpQkFDbEQsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFFakMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7b0JBQzVGLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO2lCQUNwRixDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxPQUFnQixFQUFFLE9BQWdCO1lBQy9FLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLG9CQUFhLEVBQUU7Z0JBQ3JDLE1BQU0sV0FBVyxHQUFHLGVBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7b0JBQ3BELFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixTQUFTO2lCQUNUO2dCQUVELE1BQU0sT0FBTyxHQUFHLG9CQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFckQsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDdkMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQW1CLENBQUMsQ0FBQztpQkFDOUM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUU7b0JBQzlCLE1BQU0sVUFBVSxHQUFpQjt3QkFDaEMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO3dCQUM1RixJQUFJLCtCQUFxQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7cUJBQzNDLENBQUM7b0JBRUYsSUFBSSxPQUFPLEVBQUU7d0JBQ1osVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUM3QztvQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXZFRCw4QkF1RUMifQ==
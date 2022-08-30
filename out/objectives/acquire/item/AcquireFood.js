define(["require", "exports", "game/entity/action/IAction", "game/item/ItemDescriptions", "game/entity/action/actions/Eat", "../../../core/objective/Objective", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe", "../../core/AddDifficulty", "../../other/item/MoveItemIntoInventory"], function (require, exports, IAction_1, ItemDescriptions_1, Eat_1, Objective_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1, AddDifficulty_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireFood extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return `AcquireFood:${this.options?.onlyAllowBaseItems}:${this.options?.allowDangerousFoodItems}`;
        }
        getStatus() {
            return "Acquiring food";
        }
        async execute(context) {
            const objectivePipelines = [];
            objectivePipelines.push(...AcquireFood.getFoodRecipeObjectivePipelines(context, false));
            if (this.options?.onlyAllowBaseItems) {
                for (const item of context.utilities.item.getBaseItems(context)) {
                    if (!context.island.items.isContainableInContainer(item, context.human.inventory)) {
                        if (context.utilities.item.foodItemTypes.has(item.type)) {
                            objectivePipelines.push([
                                new MoveItemIntoInventory_1.default(item).passAcquireData(this),
                            ]);
                        }
                    }
                }
            }
            else {
                for (const itemType of context.utilities.item.foodItemTypes) {
                    objectivePipelines.push([
                        new AcquireItem_1.default(itemType).passAcquireData(this),
                    ]);
                }
            }
            if (this.options?.allowDangerousFoodItems) {
                objectivePipelines.push([
                    new AddDifficulty_1.default(100),
                    new AcquireItemForAction_1.default(IAction_1.ActionType.Eat).passAcquireData(this),
                ]);
            }
            return objectivePipelines;
        }
        static getFoodRecipeObjectivePipelines(context, eatFood) {
            const objectivePipelines = [];
            for (const itemType of context.utilities.item.foodItemTypes) {
                const description = ItemDescriptions_1.itemDescriptions[itemType];
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
                    if (eatFood) {
                        objectivePipelines.push([
                            new AcquireItemWithRecipe_1.default(itemType, recipe).keepInInventory(),
                            new UseItem_1.default(Eat_1.default),
                        ]);
                    }
                    else {
                        objectivePipelines.push([
                            new AcquireItemWithRecipe_1.default(itemType, recipe)
                        ]);
                    }
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = AcquireFood;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixPQUFzQztZQUNsRSxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVuRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDbkcsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFO2dCQUVyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUNsRixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUN4RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7Z0NBQ3ZCLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQzs2QkFDckQsQ0FBQyxDQUFDO3lCQUNIO3FCQUNEO2lCQUNEO2FBRUQ7aUJBQU07Z0JBQ04sS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQzVELGtCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDdkIsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7cUJBQy9DLENBQUMsQ0FBQztpQkFDSDthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFO2dCQUMxQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksdUJBQWEsQ0FBQyxHQUFHLENBQUM7b0JBQ3RCLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO2lCQUM5RCxDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxPQUFnQixFQUFFLE9BQWdCO1lBQy9FLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDNUQsTUFBTSxXQUFXLEdBQUcsbUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7b0JBQ3BELFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixTQUFTO2lCQUNUO2dCQUVELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU1RSxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUN2QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBbUIsQ0FBQyxDQUFDO2lCQUM5QztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxPQUFPLEVBQUU7d0JBQ1osa0JBQWtCLENBQUMsSUFBSSxDQUFDOzRCQUN2QixJQUFJLCtCQUFxQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxlQUFlLEVBQUU7NEJBQzdELElBQUksaUJBQU8sQ0FBQyxhQUFHLENBQUM7eUJBQ2hCLENBQUMsQ0FBQztxQkFFSDt5QkFBTTt3QkFDTixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7NEJBQ3ZCLElBQUksK0JBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQzt5QkFDM0MsQ0FBQyxDQUFDO3FCQUNIO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXhGRCw4QkF3RkMifQ==
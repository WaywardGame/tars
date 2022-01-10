define(["require", "exports", "game/entity/action/IAction", "game/item/Items", "../../../core/objective/Objective", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe"], function (require, exports, IAction_1, Items_1, Objective_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1) {
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
                    new AcquireItem_1.default(itemType).passAcquireData(this),
                ]);
            }
            if (this.allowDangerousFoodItems) {
                objectivePipelines.push([
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
                    if (eatFood) {
                        objectivePipelines.push([
                            new AcquireItemWithRecipe_1.default(itemType, recipe).keepInInventory(),
                            new UseItem_1.default(IAction_1.ActionType.Eat),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLDBCQUFtQyxLQUFLO1lBQ3BFLEtBQUssRUFBRSxDQUFDO1lBRG9CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBaUI7UUFFckUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsS0FBSyxNQUFNLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQzVELGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7aUJBQy9DLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBRWpDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO2lCQUNqRixDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxPQUFnQixFQUFFLE9BQWdCO1lBQy9FLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDNUQsTUFBTSxXQUFXLEdBQUcsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtvQkFDcEQsU0FBUztpQkFDVDtnQkFFRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRTVFLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFtQixDQUFDLENBQUM7aUJBQzlDO2dCQUVELElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFO29CQUM5QixJQUFJLE9BQU8sRUFBRTt3QkFDWixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7NEJBQ3ZCLElBQUksK0JBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLGVBQWUsRUFBRTs0QkFDN0QsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDO3lCQUMzQixDQUFDLENBQUM7cUJBRUg7eUJBQU07d0JBQ04sa0JBQWtCLENBQUMsSUFBSSxDQUFDOzRCQUN2QixJQUFJLCtCQUFxQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7eUJBQzNDLENBQUMsQ0FBQztxQkFDSDtpQkFDRDthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUExRUQsOEJBMEVDIn0=
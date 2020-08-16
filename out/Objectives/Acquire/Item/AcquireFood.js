define(["require", "exports", "entity/action/IAction", "item/Items", "../../../Context", "../../../Objective", "../../../Objectives/ContextData/SetContextData", "../../../Objectives/Other/UseItem", "../../../Utilities/Item", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe"], function (require, exports, IAction_1, Items_1, Context_1, Objective_1, SetContextData_1, UseItem_1, Item_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1) {
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
                    new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItem_1.default(itemType).passContextDataKey(this),
                ]);
            }
            if (this.allowDangerousFoodItems) {
                objectivePipelines.push([
                    new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
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
                        new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLDBCQUFtQyxLQUFLO1lBQ3BFLEtBQUssRUFBRSxDQUFDO1lBRG9CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBaUI7UUFFckUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRzlDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUV4RixLQUFLLE1BQU0sUUFBUSxJQUFJLG9CQUFhLEVBQUU7Z0JBQ3JDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSx3QkFBYyxDQUFDLHlCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDO29CQUM1RixJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2lCQUNsRCxDQUFDLENBQUM7YUFDSDtZQUVELElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUVqQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksd0JBQWMsQ0FBQyx5QkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQztvQkFDNUYsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7aUJBQ3BGLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU0sTUFBTSxDQUFDLCtCQUErQixDQUFDLE9BQWdCLEVBQUUsT0FBZ0I7WUFDL0UsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksb0JBQWEsRUFBRTtnQkFDckMsTUFBTSxXQUFXLEdBQUcsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtvQkFDcEQsU0FBUztpQkFDVDtnQkFFRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsb0JBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVyRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUN2QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBbUIsQ0FBQyxDQUFDO2lCQUM5QztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRTtvQkFDOUIsTUFBTSxVQUFVLEdBQWlCO3dCQUNoQyxJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7d0JBQzVGLElBQUksK0JBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztxQkFDM0MsQ0FBQztvQkFFRixJQUFJLE9BQU8sRUFBRTt3QkFDWixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQzdDO29CQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDcEM7YUFDRDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBdkVELDhCQXVFQyJ9
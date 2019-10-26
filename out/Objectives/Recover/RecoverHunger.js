define(["require", "exports", "entity/action/IAction", "entity/IStats", "item/IItem", "item/Items", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../Acquire/Item/AcquireItem", "../Acquire/Item/AcquireItemForAction", "../Acquire/Item/AcquireItemWithRecipe", "../ContextData/SetContextData", "../Other/UseItem"], function (require, exports, IAction_1, IStats_1, IItem_1, Items_1, Context_1, IObjective_1, Objective_1, Base_1, Item_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1, SetContextData_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const goodFoodItems = [IItem_1.ItemTypeGroup.Food, IItem_1.ItemType.Giblets, IItem_1.ItemType.AnimalFat];
    class RecoverHunger extends Objective_1.default {
        constructor(exceededThreshold) {
            super();
            this.exceededThreshold = exceededThreshold;
        }
        getIdentifier() {
            return "RecoverHunger";
        }
        async execute(context) {
            const hunger = context.player.getStat(IStats_1.Stat.Hunger);
            if (!this.exceededThreshold) {
                if ((hunger.value / hunger.max) < 0.9) {
                    if (Base_1.hasBase(context) && Base_1.isNearBase(context)) {
                        const foodRecipeObjectivePipelines = this.getFoodRecipeObjectivePipelines(context, false);
                        if (foodRecipeObjectivePipelines.length > 0) {
                            return foodRecipeObjectivePipelines;
                        }
                    }
                    const foodItems = this.getFoodItems(context);
                    if (foodItems.length > 0) {
                        this.log.info(`Eating ${foodItems[0].getName(false).getString()}`);
                        return new UseItem_1.default(IAction_1.ActionType.Eat, foodItems[0]);
                    }
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = hunger.value < 0;
            let foodItems = this.getFoodItems(context);
            if (isEmergency && foodItems.length === 0) {
                foodItems = Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Eat);
            }
            if (foodItems.length > 0) {
                this.log.info(`Eating ${foodItems[0].getName(false).getString()}`);
                return new UseItem_1.default(IAction_1.ActionType.Eat, foodItems[0]);
            }
            const objectivePipelines = [];
            objectivePipelines.push(...this.getFoodRecipeObjectivePipelines(context, true));
            for (const itemType of RecoverHunger.foodItemTypes) {
                objectivePipelines.push([
                    new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItem_1.default(itemType),
                    new UseItem_1.default(IAction_1.ActionType.Eat),
                ]);
            }
            if (isEmergency) {
                objectivePipelines.push([
                    new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new AcquireItemForAction_1.default(IAction_1.ActionType.Eat).addDifficulty(100),
                    new UseItem_1.default(IAction_1.ActionType.Eat),
                ]);
            }
            return objectivePipelines;
        }
        getFoodRecipeObjectivePipelines(context, eatFood) {
            const objectivePipelines = [];
            for (const itemType of RecoverHunger.foodItemTypes) {
                const description = Items_1.itemDescriptions[itemType];
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
        getFoodItems(context) {
            const items = [];
            for (const itemType of RecoverHunger.foodItemTypes) {
                items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType, true));
            }
            return items
                .sort((a, b) => {
                const decayA = a.decay !== undefined ? a.decay : 999999;
                const decayB = b.decay !== undefined ? b.decay : 999999;
                return decayA > decayB ? 1 : -1;
            });
        }
        static getFoodItemTypes() {
            const result = [];
            for (const itemTypeOrGroup of goodFoodItems) {
                const itemTypes = itemManager.isGroup(itemTypeOrGroup) ? itemManager.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
                for (const itemType of itemTypes) {
                    const description = Items_1.default[itemType];
                    if (description) {
                        const onUse = description.onUse;
                        if (onUse) {
                            const onEat = onUse[IAction_1.ActionType.Eat];
                            if (onEat) {
                                if (onEat[0] >= 0) {
                                    result.push(itemType);
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }
    }
    exports.default = RecoverHunger;
    RecoverHunger.foodItemTypes = RecoverHunger.getFoodItemTypes();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsTUFBTSxhQUFhLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLElBQUksRUFBRSxnQkFBUSxDQUFDLE9BQU8sRUFBRSxnQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWpGLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUluRCxZQUE2QixpQkFBMEI7WUFDdEQsS0FBSyxFQUFFLENBQUM7WUFEb0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBRXZELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3RCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUN0QyxJQUFJLGNBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxpQkFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM1QyxNQUFNLDRCQUE0QixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzFGLElBQUksNEJBQTRCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDNUMsT0FBTyw0QkFBNEIsQ0FBQzt5QkFDcEM7cUJBQ0Q7b0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxTQUFTLENBQUMs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
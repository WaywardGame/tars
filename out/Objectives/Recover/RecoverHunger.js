define(["require", "exports", "entity/action/IAction", "entity/IStats", "item/IItem", "item/Items", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../Acquire/Item/AcquireItem", "../Acquire/Item/AcquireItemForAction", "../Acquire/Item/AcquireItemWithRecipe", "../ContextData/SetContextData", "../Other/UseItem"], function (require, exports, IAction_1, IStats_1, IItem_1, Items_1, Context_1, IObjective_1, Objective_1, Base_1, Item_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1, SetContextData_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
    class RecoverHunger extends Objective_1.default {
        constructor(exceededThreshold) {
            super();
            this.exceededThreshold = exceededThreshold;
        }
        getIdentifier() {
            return "RecoverHunger";
        }
        async execute(context) {
            const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
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
                                if (onEat[0] > 1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsTUFBTSxhQUFhLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLFNBQVMsRUFBRSxxQkFBYSxDQUFDLEtBQUssRUFBRSxxQkFBYSxDQUFDLElBQUksRUFBRSxxQkFBYSxDQUFDLFVBQVUsRUFBRSxxQkFBYSxDQUFDLFVBQVUsRUFBRSxxQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWpLLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUluRCxZQUE2QixpQkFBMEI7WUFDdEQsS0FBSyxFQUFFLENBQUM7WUFEb0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBRXZELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFFNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRTtvQkFDdEMsSUFBSSxjQUFPLENBQUMsT0FBTyxDQUFDLElBQUksaUJBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDNUMsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMxRixJQUFJLDRCQUE0QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7NEJBQzVDLE9BQU8sNEJBQTRCLENBQUM7eUJBQ3BDO3FCQUNEO29CQUVE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
define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireFood", "../other/item/MoveItemIntoInventory", "../other/item/UseItem"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, AcquireFood_1, MoveItemIntoInventory_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const decayingSoonThreshold = 50;
    class RecoverHunger extends Objective_1.default {
        constructor(onlyUseAvailableItems, exceededThreshold) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
            this.exceededThreshold = exceededThreshold;
        }
        getIdentifier() {
            return `RecoverHunger:${this.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering hunger";
        }
        async execute(context) {
            const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
            if (this.onlyUseAvailableItems) {
                const foodItems = this.exceededThreshold ? this.getFoodItemsInInventory(context) : undefined;
                return foodItems?.[0] ? this.eatItem(context, foodItems[0]) : IObjective_1.ObjectiveResult.Ignore;
            }
            if (!this.exceededThreshold) {
                if ((hunger.value / hunger.max) < 0.9) {
                    let decayingSoonFoodItems = [];
                    if (context.utilities.base.isNearBase(context)) {
                        const foodItemsInBase = this.getFoodItemsInBase(context);
                        const availableFoodItems = foodItemsInBase.concat(this.getFoodItemsInInventory(context));
                        if (availableFoodItems.length < 10) {
                            const foodRecipeObjectivePipelines = AcquireFood_1.default.getFoodRecipeObjectivePipelines(context, false);
                            if (foodRecipeObjectivePipelines.length > 0) {
                                return foodRecipeObjectivePipelines;
                            }
                        }
                        decayingSoonFoodItems = decayingSoonFoodItems.concat(foodItemsInBase.filter(item => item.decay === undefined || item.decay <= decayingSoonThreshold));
                    }
                    decayingSoonFoodItems = decayingSoonFoodItems.concat(this.getFoodItemsInInventory(context).filter(item => item.decay === undefined || item.decay <= decayingSoonThreshold));
                    if (decayingSoonFoodItems.length > 0) {
                        return this.eatItem(context, decayingSoonFoodItems[0]);
                    }
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = hunger.value < 0;
            let foodItems = [];
            if (context.utilities.base.isNearBase(context)) {
                foodItems = this.getFoodItemsInBase(context);
            }
            if (foodItems.length === 0) {
                foodItems = this.getFoodItemsInInventory(context);
                if (isEmergency && foodItems.length === 0) {
                    foodItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Eat);
                }
            }
            if (foodItems.length > 0) {
                return this.eatItem(context, foodItems[0]);
            }
            return [
                new AcquireFood_1.default(isEmergency).keepInInventory(),
                new UseItem_1.default(IAction_1.ActionType.Eat),
            ];
        }
        getFoodItemsInInventory(context) {
            return Array.from(context.utilities.item.foodItemTypes)
                .map(foodItemType => context.island.items.getItemsInContainerByType(context.player.inventory, foodItemType, { includeSubContainers: true }))
                .flat()
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        }
        getFoodItemsInBase(context) {
            return context.base.chest
                .map(chest => context.island.items.getItemsInContainer(chest, { includeSubContainers: true })
                .filter(item => context.utilities.item.foodItemTypes.has(item.type)))
                .flat()
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        }
        eatItem(context, item) {
            this.log.info(`Eating ${item.getName().getString()}`);
            return [
                new MoveItemIntoInventory_1.default(item),
                new UseItem_1.default(IAction_1.ActionType.Eat, item),
            ];
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUVqQyxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIscUJBQThCLEVBQW1CLGlCQUEwQjtZQUN2RyxLQUFLLEVBQUUsQ0FBQztZQURvQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQVM7WUFBbUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBRXhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RixPQUFPLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDckY7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENB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
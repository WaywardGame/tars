define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/action/actions/Eat", "game/entity/player/IPlayer", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireFood", "../other/item/MoveItemIntoInventory", "../other/item/UseItem"], function (require, exports, IAction_1, IStats_1, Eat_1, IPlayer_1, IObjective_1, Objective_1, AcquireFood_1, MoveItemIntoInventory_1, UseItem_1) {
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
            const hunger = context.human.stat.get(IStats_1.Stat.Hunger);
            if (this.onlyUseAvailableItems) {
                const foodItems = this.exceededThreshold ? this.getFoodItemsInInventory(context) : undefined;
                return foodItems?.[0] ? this.eatItem(context, foodItems[0]) : IObjective_1.ObjectiveResult.Ignore;
            }
            if (!this.exceededThreshold) {
                if ((hunger.value / hunger.max) < 0.9) {
                    let decayingSoonFoodItems = [];
                    if (context.utilities.base.isNearBase(context) && context.human.getWeightStatus() === IPlayer_1.WeightStatus.None) {
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
            if (context.utilities.base.isNearBase(context) && context.human.getWeightStatus() === IPlayer_1.WeightStatus.None) {
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
                new AcquireFood_1.default({ allowDangerousFoodItems: isEmergency }).keepInInventory(),
                new UseItem_1.default(Eat_1.default),
            ];
        }
        getFoodItemsInInventory(context) {
            return Array.from(context.utilities.item.foodItemTypes)
                .map(foodItemType => context.utilities.item.getItemsInContainerByType(context, context.human.inventory, foodItemType))
                .flat()
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        }
        getFoodItemsInBase(context) {
            return context.base.chest
                .map(chest => context.utilities.item.getItemsInContainer(context, chest)
                .filter(item => context.utilities.item.foodItemTypes.has(item.type)))
                .flat()
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        }
        eatItem(context, item) {
            this.log.info(`Eating ${item.getName().getString()}`);
            return [
                new MoveItemIntoInventory_1.default(item).keepInInventory(),
                new UseItem_1.default(Eat_1.default, item),
            ];
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUVqQyxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIscUJBQThCLEVBQW1CLGlCQUEwQjtZQUN2RyxLQUFLLEVBQUUsQ0FBQztZQURvQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQVM7WUFBbUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBRXhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTdELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RixPQUFPLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDckY7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENB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
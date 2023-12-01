/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/IStats", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/action/actions/Eat", "@wayward/game/game/entity/player/IPlayer", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireFood", "../other/item/MoveItemIntoInventory", "../other/item/UseItem"], function (require, exports, IStats_1, IAction_1, Eat_1, IPlayer_1, IObjective_1, Objective_1, AcquireFood_1, MoveItemIntoInventory_1, UseItem_1) {
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
                        decayingSoonFoodItems = decayingSoonFoodItems.concat(foodItemsInBase.filter(item => item.getDecayTime() === undefined || item.getDecayTime() <= decayingSoonThreshold));
                    }
                    decayingSoonFoodItems = decayingSoonFoodItems.concat(this.getFoodItemsInInventory(context).filter(item => item.getDecayTime() === undefined || item.getDecayTime() <= decayingSoonThreshold));
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
                .sort((a, b) => (a.getDecayTime() ?? 999999) - (b.getDecayTime() ?? 999999));
        }
        getFoodItemsInBase(context) {
            return context.base.chest
                .map(chest => context.utilities.item.getItemsInContainer(context, chest)
                .filter(item => context.utilities.item.foodItemTypes.has(item.type)))
                .flat()
                .sort((a, b) => (a.getDecayTime() ?? 999999) - (b.getDecayTime() ?? 999999));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFzQkgsTUFBTSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7SUFFakMsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLHFCQUE4QixFQUFtQixpQkFBMEI7WUFDdkcsS0FBSyxFQUFFLENBQUM7WUFEb0IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFTO1lBQW1CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUV4RyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3RCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3RixPQUFPLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxNQUFNLENBQUM7WUFDdEYsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENB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
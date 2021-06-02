define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "../../IObjective", "../../Objective", "../../utilities/Base", "../../utilities/Item", "../acquire/item/AcquireFood", "../core/MoveToTarget", "../other/item/UseItem"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, Base_1, Item_1, AcquireFood_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const decayingSoonThreshold = 50;
    class RecoverHunger extends Objective_1.default {
        constructor(exceededThreshold) {
            super();
            this.exceededThreshold = exceededThreshold;
        }
        getIdentifier() {
            return "RecoverHunger";
        }
        getStatus() {
            return "Recovering hunger";
        }
        async execute(context) {
            const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
            if (!this.exceededThreshold) {
                if ((hunger.value / hunger.max) < 0.9) {
                    let decayingSoonFoodItems = [];
                    if (Base_1.baseUtilities.isNearBase(context)) {
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
            if (Base_1.baseUtilities.isNearBase(context)) {
                foodItems = this.getFoodItemsInBase(context);
            }
            if (foodItems.length === 0) {
                foodItems = this.getFoodItemsInInventory(context);
                if (isEmergency && foodItems.length === 0) {
                    foodItems = Item_1.itemUtilities.getInventoryItemsWithUse(context, IAction_1.ActionType.Eat);
                }
            }
            if (foodItems.length > 0) {
                return this.eatItem(context, foodItems[0]);
            }
            return [
                new AcquireFood_1.default(isEmergency),
                new UseItem_1.default(IAction_1.ActionType.Eat),
            ];
        }
        getFoodItemsInInventory(context) {
            return Array.from(Item_1.itemUtilities.foodItemTypes)
                .map(foodItemType => itemManager.getItemsInContainerByType(context.player.inventory, foodItemType, true))
                .flat()
                .sort((a, b) => { var _a, _b; return ((_a = a.decay) !== null && _a !== void 0 ? _a : 999999) - ((_b = b.decay) !== null && _b !== void 0 ? _b : 999999); });
        }
        getFoodItemsInBase(context) {
            return context.base.chest
                .map(chest => itemManager.getItemsInContainer(chest, true)
                .filter(item => Item_1.itemUtilities.foodItemTypes.has(item.type)))
                .flat()
                .sort((a, b) => { var _a, _b; return ((_a = a.decay) !== null && _a !== void 0 ? _a : 999999) - ((_b = b.decay) !== null && _b !== void 0 ? _b : 999999); });
        }
        eatItem(context, item) {
            this.log.info(`Eating ${item.getName(false).getString()}`);
            if (!itemManager.isContainableInContainer(item, context.player.inventory)) {
                return [new MoveToTarget_1.default(item.getPoint(), true), new UseItem_1.default(IAction_1.ActionType.Eat, item)];
            }
            return new UseItem_1.default(IAction_1.ActionType.Eat, item);
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUVqQyxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsaUJBQTBCO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUV2RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5RCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUN0QyxJQUFJLHFCQUFxQixHQUFXLEVBQUUsQ0FBQztvQkFFdkMsSUFBSSxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFFdEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUV6RCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ3pGLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRTs0QkFDbkMsTUFBTSw0QkFBNEIsR0FBRyxxQkFBVyxD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
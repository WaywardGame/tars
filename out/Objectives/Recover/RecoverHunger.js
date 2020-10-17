define(["require", "exports", "entity/action/IAction", "entity/IStats", "../../IObjective", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../Acquire/Item/AcquireFood", "../Other/UseItem"], function (require, exports, IAction_1, IStats_1, IObjective_1, Objective_1, Base_1, Item_1, AcquireFood_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                    if (Base_1.isNearBase(context)) {
                        const foodRecipeObjectivePipelines = AcquireFood_1.default.getFoodRecipeObjectivePipelines(context, false);
                        if (foodRecipeObjectivePipelines.length > 0) {
                            return foodRecipeObjectivePipelines;
                        }
                    }
                    const decayingSoonFoodItems = this.getFoodItems(context).filter(item => item.decay === undefined || item.decay < 10);
                    if (decayingSoonFoodItems.length > 0) {
                        this.log.info(`Eating ${decayingSoonFoodItems[0].getName(false).getString()} since it's decaying soon (${decayingSoonFoodItems[0].decay})`);
                        return new UseItem_1.default(IAction_1.ActionType.Eat, decayingSoonFoodItems[0]);
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
            return [
                new AcquireFood_1.default(isEmergency),
                new UseItem_1.default(IAction_1.ActionType.Eat),
            ];
        }
        getFoodItems(context) {
            const items = [];
            for (const itemType of Item_1.foodItemTypes) {
                items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType, true));
            }
            return items
                .sort((a, b) => {
                const decayA = a.decay !== undefined ? a.decay : 999999;
                const decayB = b.decay !== undefined ? b.decay : 999999;
                return decayA > decayB ? 1 : -1;
            });
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsaUJBQTBCO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUV2RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5RCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUN0QyxJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3hCLE1BQU0sNEJBQTRCLEdBQUcscUJBQVcsQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ2pHLElBQUksNEJBQTRCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDNUMsT0FBTyw0QkFBNEIsQ0FBQzt5QkFDcEM7cUJBQ0Q7b0JBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxD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
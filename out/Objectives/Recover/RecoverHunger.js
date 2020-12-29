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
                        const availableFoodItems = this.getFoodItemsInBase(context).concat(this.getFoodItemsInInventory(context));
                        if (availableFoodItems.length < 10) {
                            const foodRecipeObjectivePipelines = AcquireFood_1.default.getFoodRecipeObjectivePipelines(context, false);
                            if (foodRecipeObjectivePipelines.length > 0) {
                                return foodRecipeObjectivePipelines;
                            }
                        }
                    }
                    const decayingSoonFoodItems = this.getFoodItemsInInventory(context).filter(item => item.decay === undefined || item.decay < 10);
                    if (decayingSoonFoodItems.length > 0) {
                        this.log.info(`Eating ${decayingSoonFoodItems[0].getName(false).getString()} since it's decaying soon (${decayingSoonFoodItems[0].decay})`);
                        return new UseItem_1.default(IAction_1.ActionType.Eat, decayingSoonFoodItems[0]);
                    }
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isEmergency = hunger.value < 0;
            let foodItems = this.getFoodItemsInInventory(context);
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
        getFoodItemsInInventory(context) {
            const items = [];
            for (const itemType of Item_1.foodItemTypes) {
                items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType, true));
            }
            return items
                .sort((a, b) => {
                const decayA = a.decay !== undefined ? a.decay : 999999;
                const decayB = b.decay !== undefined ? b.decay : 999999;
                return decayA - decayB;
            });
        }
        getFoodItemsInBase(context) {
            const items = [];
            for (const chest of context.base.chest) {
                items.push(...itemManager.getItemsInContainer(chest, true).filter(item => Item_1.foodItemTypes.has(item.type)));
            }
            return items
                .sort((a, b) => {
                const decayA = a.decay !== undefined ? a.decay : 999999;
                const decayB = b.decay !== undefined ? b.decay : 999999;
                return decayA - decayB;
            });
        }
    }
    exports.default = RecoverHunger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsaUJBQTBCO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUV2RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5RCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUN0QyxJQUFJLGlCQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBRXhCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDMUcsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFOzRCQUNuQyxNQUFNLDRCQUE0QixHQUFHLHFCQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUNqRyxJQUFJLDRCQUE0QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0NBQzVDLE9BQU8sNEJBQTRCLENBQUM7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
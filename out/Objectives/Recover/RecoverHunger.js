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
                        this.log.info(`Eating ${decayingSoonFoodItems[0].getName(false).getString()}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlckh1bmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3Zlckh1bmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsaUJBQTBCO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUV2RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBRTVCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQ3RDLElBQUksaUJBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDeEIsTUFBTSw0QkFBNEIsR0FBRyxxQkFBVyxDQUFDLCtCQUErQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDakcsSUFBSSw0QkFBNEIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUM1QyxPQUFPLDRCQUE0QixDQUFDO3lCQUNwQztxQkFDRDtvQkFFRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDckgsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQy9FLE9BQU8sSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdEO2lCQUNEO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVyQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTNDLElBQUksV0FBVyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMxQyxTQUFTLEdBQUcsK0JBQXdCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDOUQ7WUFFRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqRDtZQUVELE9BQU87Z0JBQ04sSUFBSSxxQkFBVyxDQUFDLFdBQVcsQ0FBQztnQkFDNUIsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDO2FBQzNCLENBQUM7UUFDSCxDQUFDO1FBRU8sWUFBWSxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQztZQUV6QixLQUFLLE1BQU0sUUFBUSxJQUFJLG9CQUFhLEVBQUU7Z0JBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDL0Y7WUFFRCxPQUFPLEtBQUs7aUJBQ1YsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNkLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hELE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FFRDtJQW5FRCxnQ0FtRUMifQ==
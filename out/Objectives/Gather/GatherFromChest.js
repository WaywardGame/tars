define(["require", "exports", "entity/action/IAction", "item/IItem", "../../Context", "../../Objective", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Core/ReserveItems"], function (require, exports, IAction_1, IItem_1, Context_1, Objective_1, SetContextData_1, ExecuteAction_1, MoveToTarget_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getIdentifier(context) {
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context ? context.getData(Context_1.ContextDataType.NextActionAllowsIntermediateChest) : null}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        canGroupTogether() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            const chests = context.base.chest.slice();
            if (!context.getData(Context_1.ContextDataType.NextActionAllowsIntermediateChest)) {
                chests.push(...context.base.intermediateChest);
            }
            return chests
                .map(chest => ({
                chest: chest,
                items: itemManager.getItemsInContainerByType(chest, this.itemType, true)
                    .filter(item => !context.isReservedItem(item)),
            }))
                .filter(chestInfo => chestInfo.items.length > 0)
                .map(({ chest, items }) => {
                const item = items[0];
                return [
                    new MoveToTarget_1.default(chest, true),
                    new ReserveItems_1.default(item),
                    new SetContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, item),
                    new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, context.player.inventory);
                    }),
                ];
            });
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRXJELFlBQTZCLFFBQWtCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFL0MsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFpQjtZQUNyQyxPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1SSxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFJTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQWEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFO2dCQUd4RSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsT0FBTyxNQUFNO2lCQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDO3FCQUNwRixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0MsQ0FBQyxDQUFDO2lCQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztpQkFDL0MsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtnQkFDekIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixPQUFPO29CQUNOLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO29CQUM3QixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDO29CQUN0QixJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7b0JBQzFELElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDMUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNoRSxDQUFDLENBQUM7aUJBQ0YsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNEO0lBcERELGtDQW9EQyJ9
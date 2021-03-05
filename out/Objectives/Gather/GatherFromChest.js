define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../IContext", "../../Objective", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Core/ReserveItems"], function (require, exports, IAction_1, IItem_1, IContext_1, Objective_1, SetContextData_1, ExecuteAction_1, MoveToTarget_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getIdentifier(context) {
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context === null || context === void 0 ? void 0 : context.getData(IContext_1.ContextDataType.PrioritizeBaseChests)}:${context === null || context === void 0 ? void 0 : context.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            const prioritizeBaseChests = context.getData(IContext_1.ContextDataType.PrioritizeBaseChests);
            let chests = context.base.chest.slice();
            if (!context.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)) {
                chests = chests.concat(context.base.intermediateChest);
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
                    new MoveToTarget_1.default(chest, true).overrideDifficulty(prioritizeBaseChests ? 5 : undefined),
                    new ReserveItems_1.default(item),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, context.player.inventory);
                    }).setStatus(() => `Moving ${item.getName()} to inventory`),
                ];
            });
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRXJELFlBQTZCLFFBQWtCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFL0MsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFpQjtZQUNyQyxPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxDQUFDLDBCQUFlLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDO1FBQ3RMLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBU00sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFbkYsSUFBSSxNQUFNLEdBQWEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFO2dCQUd4RSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDdkQ7WUFFRCxPQUFPLE1BQU07aUJBQ1gsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDZCxLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsV0FBVyxDQUFDLHlCQUF5QixDQUFDLEtBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7cUJBQ3BGLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQyxDQUFDLENBQUM7aUJBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2lCQUMvQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUN6QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU87b0JBQ04sSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ3RGLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQztvQkFDN0MsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUMxRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO2lCQUMzRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUF2REQsa0NBdURDIn0=
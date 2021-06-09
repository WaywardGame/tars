define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../IContext", "../../Objective", "../contextData/SetContextData", "../core/ExecuteAction", "../core/MoveToTarget", "../core/ReserveItems"], function (require, exports, IAction_1, IItem_1, IContext_1, Objective_1, SetContextData_1, ExecuteAction_1, MoveToTarget_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
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
                    .filter(item => !context.isReservedItem(item) &&
                    (this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur))),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRXJELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWlCO1lBQ3JDLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUM7UUFDdEwsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFTTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRixJQUFJLE1BQU0sR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGlDQUFpQyxDQUFDLEVBQUU7Z0JBR3hFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sTUFBTTtpQkFDWCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNkLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztxQkFDcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ2QsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztvQkFDN0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUMzSCxDQUFDLENBQUM7aUJBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2lCQUMvQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUN6QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU87b0JBQ04sSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ3RGLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQztvQkFDN0MsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUMxRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO2lCQUMzRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUF6REQsa0NBeURDIn0=
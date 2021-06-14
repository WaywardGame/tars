define(["require", "exports", "game/item/IItem", "../../IContext", "../../Objective", "../contextData/SetContextData", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, IContext_1, Objective_1, SetContextData_1, ReserveItems_1, MoveItemIntoInventory_1) {
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
                    new ReserveItems_1.default(item),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new MoveItemIntoInventory_1.default(item).overrideDifficulty(prioritizeBaseChests ? 5 : undefined),
                ];
            });
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRXJELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWlCO1lBQ3JDLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUM7UUFDdEwsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFTTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRixJQUFJLE1BQU0sR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGlDQUFpQyxDQUFDLEVBQUU7Z0JBR3hFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sTUFBTTtpQkFDWCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNkLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztxQkFDcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ2QsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztvQkFDN0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUMzSCxDQUFDLENBQUM7aUJBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2lCQUMvQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUN6QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU87b0JBQ04sSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQztvQkFDdEIsSUFBSSx3QkFBYyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDO29CQUM3QyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztpQkFDeEYsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNEO0lBdERELGtDQXNEQyJ9
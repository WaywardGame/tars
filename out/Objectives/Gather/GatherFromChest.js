define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/context/IContext", "../../core/objective/Objective", "../../utilities/Item", "../contextData/SetContextData", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IContext_1, Objective_1, Item_1, SetContextData_1, ReserveItems_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
        }
        getIdentifier(context) {
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context?.getData(IContext_1.ContextDataType.PrioritizeBaseChests)}:${context?.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from a chest`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
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
                .map(chest => {
                const items = context.utilities.item.getItemsInContainerByType(context, chest, this.itemType)
                    .filter(item => {
                    if (context.isHardReservedItem(item)) {
                        return false;
                    }
                    if (this.options.requiredMinDur !== undefined && (item.minDur === undefined || item.minDur < this.options.requiredMinDur)) {
                        return false;
                    }
                    if (this.options.requirePlayerCreatedIfCraftable) {
                        const canCraft = item.description()?.recipe;
                        if (canCraft && !item.ownerIdentifier) {
                            return false;
                        }
                    }
                    return true;
                });
                if (items.length > 0) {
                    const item = items[0];
                    return [
                        new ReserveItems_1.default(item).passAcquireData(this),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new MoveItemIntoInventory_1.default(item).overrideDifficulty(prioritizeBaseChests ? 5 : undefined),
                    ];
                }
                return undefined;
            })
                .filter(objectives => objectives !== undefined);
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBS3JELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWlCO1lBQ3JDLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sRUFBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLE9BQU8sRUFBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUM7UUFDdEwsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUM7UUFDbkcsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQVNNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRixJQUFJLE1BQU0sR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGlDQUFpQyxDQUFDLEVBQUU7Z0JBR3hFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sTUFBTTtpQkFDWCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ1osTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLEtBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztxQkFDekcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNkLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNyQyxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTt3QkFDMUgsT0FBTyxLQUFLLENBQUM7cUJBQ2I7b0JBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFO3dCQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxDQUFDO3dCQUM1QyxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7NEJBQ3RDLE9BQU8sS0FBSyxDQUFDO3lCQUNiO3FCQUNEO29CQUVELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxDQUFDO2dCQUNKLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3JCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsT0FBTzt3QkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQzt3QkFDNUMsSUFBSSx3QkFBYyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDO3dCQUM3QyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztxQkFDeEYsQ0FBQztpQkFDRjtnQkFFRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUM7aUJBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBbUIsQ0FBQztRQUNwRSxDQUFDO0tBQ0Q7SUE3RUQsa0NBNkVDIn0=
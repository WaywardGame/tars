define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/context/IContext", "../../core/objective/Objective", "../contextData/SetContextData", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IContext_1, Objective_1, SetContextData_1, ReserveItems_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
        }
        getIdentifier(context) {
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context?.getData(IContext_1.ContextDataType.PrioritizeBaseItems)}:${context?.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from a chest`;
        }
        canIncludeContextHashCode(context, objectiveHashCode) {
            return {
                objectiveHashCode,
                itemTypes: new Set([this.itemType]),
            };
        }
        shouldIncludeContextHashCode(context, objectiveHashCode) {
            return context.isReservedItemType(this.itemType, objectiveHashCode);
        }
        async execute(context, objectiveHashCode) {
            const prioritizeBaseItems = context.getData(IContext_1.ContextDataType.PrioritizeBaseItems);
            let chests = context.base.chest;
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
                    if (this.options.requiredMinDur !== undefined && (item.durability === undefined || item.durability < this.options.requiredMinDur)) {
                        return false;
                    }
                    if (this.options.requirePlayerCreatedIfCraftable) {
                        const canCraft = item.description?.recipe;
                        if (canCraft && !item.crafterIdentifier) {
                            return false;
                        }
                    }
                    if (this.options.willDestroyItem && !context.utilities.item.canDestroyItem(context, item)) {
                        return false;
                    }
                    return true;
                });
                if (items.length > 0) {
                    const item = items[0];
                    return [
                        new ReserveItems_1.default(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new MoveItemIntoInventory_1.default(item).overrideDifficulty(prioritizeBaseItems ? 5 : undefined),
                    ];
                }
                return undefined;
            })
                .filter(objectives => objectives !== undefined);
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRXJELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQTRCO1lBQ2hELE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sRUFBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLE9BQU8sRUFBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUM7UUFDckwsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUM7UUFDbkcsQ0FBQztRQUVlLHlCQUF5QixDQUFDLE9BQWdCLEVBQUUsaUJBQXlCO1lBQ3BGLE9BQU87Z0JBQ04saUJBQWlCO2dCQUNqQixTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkMsQ0FBQztRQUNILENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQixFQUFFLGlCQUF5QjtZQUd2RixPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDckUsQ0FBQztRQVNNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0IsRUFBRSxp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
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
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context === null || context === void 0 ? void 0 : context.getData(IContext_1.ContextDataType.PrioritizeBaseChests)}:${context === null || context === void 0 ? void 0 : context.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from a chest`;
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
                .map(chest => {
                const items = context.island.items.getItemsInContainerByType(chest, this.itemType, { includeSubContainers: true })
                    .filter(item => {
                    var _a;
                    if (context.isHardReservedItem(item)) {
                        return false;
                    }
                    if (this.options.requiredMinDur !== undefined && (item.minDur === undefined || item.minDur < this.options.requiredMinDur)) {
                        return false;
                    }
                    if (this.options.requirePlayerCreatedIfCraftable) {
                        const canCraft = (_a = item.description()) === null || _a === void 0 ? void 0 : _a.recipe;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBS3JELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWlCO1lBQ3JDLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLENBQUMsMEJBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUM7UUFDdEwsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUM7UUFDbkcsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFTZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVuRixJQUFJLE1BQU0sR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGlDQUFpQyxDQUFDLEVBQUU7Z0JBR3hFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sTUFBTTtpQkFDWCxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ1osTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUM7cUJBQzlILE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTs7b0JBQ2QsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sS0FBSyxDQUFDO3FCQUNiO29CQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO3dCQUMxSCxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUU7d0JBQ2pELE1BQU0sUUFBUSxHQUFHLE1BQUEsSUFBSSxDQUFDLFdBQVcsRUFBRSwwQ0FBRSxNQUFNLENBQUM7d0JBQzVDLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTs0QkFDdEMsT0FBTyxLQUFLLENBQUM7eUJBQ2I7cUJBQ0Q7b0JBRUQsT0FBTyxJQUFJLENBQUM7Z0JBQ2IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDckIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QixPQUFPO3dCQUNOLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO3dCQUM1QyxJQUFJLHdCQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUM7d0JBQzdDLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3FCQUN4RixDQUFDO2lCQUNGO2dCQUVELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFtQixDQUFDO1FBQ3BFLENBQUM7S0FDRDtJQTdFRCxrQ0E2RUMifQ==
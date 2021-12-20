define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionary", "language/ITranslation", "language/Translation", "utilities/enum/Enums", "../../../Objective", "./AcquireItem"], function (require, exports, IAction_1, IItem_1, Items_1, Dictionary_1, ITranslation_1, Translation_1, Enums_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForAction extends Objective_1.default {
        constructor(actionType) {
            super();
            this.actionType = actionType;
        }
        getIdentifier() {
            return `AcquireItemForAction:${IAction_1.ActionType[this.actionType]}`;
        }
        getStatus() {
            return `Acquiring an item to use for ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.actionType).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return AcquireItemForAction.getItems(context, this.actionType).some(itemType => context.isReservedItemType(itemType));
        }
        async execute(context) {
            return AcquireItemForAction.getItems(context, this.actionType)
                .map(item => [new AcquireItem_1.default(item).passAcquireData(this)]);
        }
        static getItems(context, actionType) {
            let result = AcquireItemForAction.cache.get(actionType);
            if (result === undefined) {
                result = [];
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const itemDescription = Items_1.itemDescriptions[it];
                    if (itemDescription && itemDescription.use !== undefined && itemDescription.use.includes(actionType)) {
                        if (actionType === IAction_1.ActionType.StartFire) {
                            if (context.island.items.isInGroup(it, IItem_1.ItemTypeGroup.LitTorch)) {
                                continue;
                            }
                        }
                        result.push(it);
                    }
                }
                AcquireItemForAction.cache.set(actionType, result);
            }
            return result;
        }
    }
    exports.default = AcquireItemForAction;
    AcquireItemForAction.cache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gb3JBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY0EsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsVUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUVuRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQ0FBZ0MscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQywwQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDckosQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUM1RCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFTSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQWdCLEVBQUUsVUFBc0I7WUFDOUQsSUFBSSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFRLENBQUMsRUFBRTtvQkFDeEMsTUFBTSxlQUFlLEdBQUcsd0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDbEMsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQ3JHLElBQUksVUFBVSxLQUFLLG9CQUFVLENBQUMsU0FBUyxFQUFFOzRCQUd4QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUscUJBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQ0FDL0QsU0FBUzs2QkFDVDt5QkFDRDt3QkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRDtnQkFFRCxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNuRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQzs7SUFyREYsdUNBc0RDO0lBcER3QiwwQkFBSyxHQUFnQyxJQUFJLEdBQUcsRUFBRSxDQUFDIn0=
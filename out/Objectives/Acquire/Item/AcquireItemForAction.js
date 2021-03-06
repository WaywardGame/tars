define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionaries", "language/Translation", "utilities/enum/Enums", "../../../Objective", "./AcquireItem"], function (require, exports, IAction_1, IItem_1, Items_1, Dictionaries_1, Translation_1, Enums_1, Objective_1, AcquireItem_1) {
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
            return `Acquiring an item to use for ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Action, this.actionType).inContext(Translation_1.TextContext.Lowercase).getString()} action`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return AcquireItemForAction.getItems(this.actionType).some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return AcquireItemForAction.getItems(this.actionType)
                .map(item => [new AcquireItem_1.default(item).passContextDataKey(this)]);
        }
        static getItems(actionType) {
            let result = AcquireItemForAction.cache.get(actionType);
            if (result === undefined) {
                result = [];
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const itemDescription = Items_1.itemDescriptions[it];
                    if (itemDescription && itemDescription.use !== undefined && itemDescription.use.includes(actionType)) {
                        if (actionType === IAction_1.ActionType.StartFire) {
                            if (itemManager.isInGroup(it, IItem_1.ItemTypeGroup.LitTorch)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gb3JBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsVUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUVuRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQ0FBZ0MscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDckosQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUcsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBQ25CLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7aUJBQ25ELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFzQjtZQUM1QyxJQUFJLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFFWixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLGVBQWUsR0FBRyx3QkFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDckcsSUFBSSxVQUFVLEtBQUssb0JBQVUsQ0FBQyxTQUFTLEVBQUU7NEJBR3hDLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUscUJBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQ0FDdEQsU0FBUzs2QkFDVDt5QkFDRDt3QkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRDtnQkFFRCxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNuRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQzs7SUFyREYsdUNBc0RDO0lBcER3QiwwQkFBSyxHQUFnQyxJQUFJLEdBQUcsRUFBRSxDQUFDIn0=
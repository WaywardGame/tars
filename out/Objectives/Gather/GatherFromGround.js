define(["require", "exports", "entity/action/IAction", "entity/IStats", "item/IItem", "../../Context", "../../Objective", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Core/ReserveItems", "../Interrupt/ReduceWeight"], function (require, exports, IAction_1, IStats_1, IItem_1, Context_1, Objective_1, SetContextData_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, ReserveItems_1, ReduceWeight_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getIdentifier() {
            return `GatherFromGround:${IItem_1.ItemType[this.itemType]}`;
        }
        canGroupTogether() {
            return true;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            const tile = context.player.getTile();
            const items = tile.containedItems;
            if (items !== undefined) {
                for (const item of items) {
                    if (item.type === this.itemType && !context.isReservedItem(item)) {
                        return [
                            new ReserveItems_1.default(item),
                            new SetContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, item),
                            new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                action.execute(context.player, item, context.player.inventory);
                            }),
                        ];
                    }
                }
            }
            return island.items
                .map(item => {
                if (item && item.type === this.itemType && itemManager.isTileContainer(item.containedWithin) && !context.isReservedItem(item)) {
                    return {
                        item: item,
                        point: item.containedWithin,
                    };
                }
                return undefined;
            })
                .filter(itemInfo => itemInfo !== undefined)
                .map(({ item: itemOnGround, point }) => {
                const objectives = [];
                const weight = context.player.stat.get(IStats_1.Stat.Weight);
                if ((weight.value + itemOnGround.getTotalWeight()) > weight.max) {
                    objectives.push(new ReduceWeight_1.default());
                }
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new ReserveItems_1.default(itemOnGround));
                objectives.push(new Lambda_1.default(async (context) => {
                    const objectives = [];
                    const tile = context.player.getFacingTile();
                    const containedItems = tile.containedItems;
                    if (containedItems !== undefined && containedItems.length > 0) {
                        const matchingItems = containedItems
                            .filter(item => item.type === this.itemType);
                        if (matchingItems.length > 0) {
                            const item = matchingItems[0];
                            objectives.push(new SetContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, item));
                            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                action.execute(context.player, item, context.player.inventory);
                            }));
                        }
                    }
                    return objectives;
                }));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 6;
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFL0MsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2xDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7b0JBQ3pCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDakUsT0FBTzs0QkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDOzRCQUN0QixJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7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
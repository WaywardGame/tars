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
            if (tile.containedItems !== undefined && tile.containedItems.length > 0) {
                const item = tile.containedItems[tile.containedItems.length - 1];
                if (item.type === this.itemType && !context.isReservedItem(item)) {
                    return [
                        new ReserveItems_1.default(item),
                        new SetContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, item),
                        new ExecuteAction_1.default(IAction_1.ActionType.Idle, (context, action) => {
                            action.execute(context.player);
                        }),
                    ];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFL0MsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDeEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDakUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNqRSxPQUFPO3dCQUNOLElBQUksc0JBQVksQ0FBQyxJQUFJLENB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
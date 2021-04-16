define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../Objective", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Core/ReserveItems"], function (require, exports, IAction_1, IItem_1, Objective_1, SetContextData_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, ReserveItems_1) {
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
                            new SetContextData_1.default(this.contextDataKey, item),
                            new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                action.execute(context.player, item, context.player.inventory);
                            }).setStatus(() => `Moving ${item.getName()} to inventory`),
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
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new ReserveItems_1.default(itemOnGround));
                objectives.push(new Lambda_1.default(async (context) => {
                    var _a;
                    const objectives = [];
                    const item = (_a = context.player.getFacingTile().containedItems) === null || _a === void 0 ? void 0 : _a.find(item => item.type === this.itemType);
                    if (item) {
                        objectives.push(new SetContextData_1.default(this.contextDataKey, item));
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, context.player.inventory);
                        }).setStatus(() => `Moving ${item.getName()} to inventory`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFL0MsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2xDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7b0JBQ3pCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDakUsT0FBTzs0QkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDOzRCQUN0QixJQUFJLHdCQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUM7NEJB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
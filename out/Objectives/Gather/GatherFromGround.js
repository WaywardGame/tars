define(["require", "exports", "game/item/IItem", "language/Dictionaries", "language/Translation", "../../Objective", "../contextData/SetContextData", "../core/Lambda", "../core/MoveToTarget", "../core/ReserveItems", "../other/item/MoveItem"], function (require, exports, IItem_1, Dictionaries_1, Translation_1, Objective_1, SetContextData_1, Lambda_1, MoveToTarget_1, ReserveItems_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
        }
        getIdentifier() {
            return `GatherFromGround:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()} from the ground`;
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
            var _a;
            const point = context.player.getPoint();
            const item = (_a = game.getTileFromPoint(point).containedItems) === null || _a === void 0 ? void 0 : _a.find(item => this.itemMatches(context, item));
            if (item) {
                return [
                    new ReserveItems_1.default(item).passAcquireData(this),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new MoveItem_1.default(item, context.player.inventory, point),
                ];
            }
            return island.items
                .map(item => {
                if (item && this.itemMatches(context, item)) {
                    return [
                        new MoveToTarget_1.default(item.containedWithin, true),
                        new ReserveItems_1.default(item).passAcquireData(this),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new Lambda_1.default(async (context) => {
                            var _a;
                            const objectives = [];
                            const point = context.player.getFacingPoint();
                            const item = (_a = game.getTileFromPoint(point).containedItems) === null || _a === void 0 ? void 0 : _a.find(item => this.itemMatches(context, item, true));
                            if (item) {
                                objectives.push(new ReserveItems_1.default(item).passAcquireData(this));
                                objectives.push(new SetContextData_1.default(this.contextDataKey, item));
                                objectives.push(new MoveItem_1.default(item, context.player.inventory, point));
                            }
                            return objectives;
                        }),
                    ];
                }
                return undefined;
            })
                .filter(objectives => objectives !== undefined);
        }
        getBaseDifficulty(context) {
            return 6;
        }
        itemMatches(context, item, fromLambda) {
            return item.type === this.itemType &&
                (fromLambda || (itemManager.isTileContainer(item.containedWithin) && !context.isHardReservedItem(item))) &&
                (this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur));
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixRQUFrQixFQUFtQixVQUF1QyxFQUFFO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7UUFFM0csQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDO1FBQ3RHLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxNQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLDBDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxF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
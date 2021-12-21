define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../Objective", "../contextData/SetContextData", "../core/Lambda", "../core/MoveToTarget", "../core/ReserveItems", "../other/item/MoveItem"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Objective_1, SetContextData_1, Lambda_1, MoveToTarget_1, ReserveItems_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
            this.gatherObjectivePriority = 500;
        }
        getIdentifier() {
            return `GatherFromGround:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from the ground`;
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
            const item = (_a = context.island.getTileFromPoint(point).containedItems) === null || _a === void 0 ? void 0 : _a.find(item => this.itemMatches(context, item));
            if (item) {
                return [
                    new ReserveItems_1.default(item).passAcquireData(this),
                    new MoveToTarget_1.default(item.containedWithin, false),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new MoveItem_1.default(item, context.player.inventory, point),
                ];
            }
            return context.island.items.getObjects()
                .map(item => {
                if (item && this.itemMatches(context, item)) {
                    return [
                        new ReserveItems_1.default(item).passAcquireData(this),
                        new MoveToTarget_1.default(item.containedWithin, true),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new Lambda_1.default(async (context) => {
                            var _a;
                            const objectives = [];
                            const point = context.player.getFacingPoint();
                            const item = (_a = context.island.getTileFromPoint(point).containedItems) === null || _a === void 0 ? void 0 : _a.find(item => this.itemMatches(context, item, true));
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
            var _a;
            if (item.type !== this.itemType) {
                return false;
            }
            if (!fromLambda && (context.isHardReservedItem(item) || !context.island.items.isTileContainer(item.containedWithin))) {
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
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUl0RCxZQUE2QixRQUFrQixFQUFtQixVQUF1QyxFQUFFO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7WUFGM0YsNEJBQXVCLEdBQUcsR0FBRyxDQUFDO1FBSTlDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQztRQUN0RyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDeEMsTUFBTSxJQUFJLEdBQUcsTUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsMENBQUUsSUFBSSxDQUFDLElBQUksQ0FB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
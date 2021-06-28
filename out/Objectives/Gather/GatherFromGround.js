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
                    new ReserveItems_1.default(item),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new MoveItem_1.default(item, context.player.inventory, point),
                ];
            }
            return island.items
                .map(item => {
                if (item && this.itemMatches(context, item)) {
                    return [
                        new MoveToTarget_1.default(item.containedWithin, true),
                        new ReserveItems_1.default(item),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new Lambda_1.default(async (context) => {
                            var _a;
                            const objectives = [];
                            const point = context.player.getFacingPoint();
                            const item = (_a = game.getTileFromPoint(point).containedItems) === null || _a === void 0 ? void 0 : _a.find(item => this.itemMatches(context, item, true));
                            if (item) {
                                objectives.push(new ReserveItems_1.default(item));
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
                (fromLambda || (itemManager.isTileContainer(item.containedWithin) && !context.isReservedItem(item))) &&
                (this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur));
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixRQUFrQixFQUFtQixVQUF1QyxFQUFFO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7UUFFM0csQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDO1FBQ3RHLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxNQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLDBDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEcsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsT0FBTztvQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDO29CQUN0QixJQUFJLHdCQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUM7b0JBQzdDLElBQUksa0JBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO2lCQUNuRCxDQUFDO2FBQ0Y7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLO2lCQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ1gsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzVDLE9BQU87d0JBQ04sSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxlQUFpQyxFQUFFLElBQUksQ0FBQzt3QkFDOUQsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQzt3QkFDdEIsSUFBSSx3QkFBYyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDO3dCQUM3QyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFOzs0QkFDMUIsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQzs0QkFHcEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsY0FBYywwQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDOUcsSUFBSSxJQUFJLEVBQUU7Z0NBQ1QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDeEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUMvRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs2QkFDckU7NEJBRUQsT0FBTyxVQUFVLENBQUM7d0JBQ25CLENBQUMsQ0FBQztxQkFDRixDQUFDO2lCQUNGO2dCQUVELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFtQixDQUFDO1FBQ3BFLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUMzQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFTyxXQUFXLENBQUMsT0FBZ0IsRUFBRSxJQUFVLEVBQUUsVUFBb0I7WUFDckUsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRO2dCQUNqQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzNILENBQUM7S0FDRDtJQTNFRCxtQ0EyRUMifQ==
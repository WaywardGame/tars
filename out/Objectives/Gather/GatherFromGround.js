define(["require", "exports", "game/item/IItem", "../../Objective", "../contextData/SetContextData", "../core/Lambda", "../core/MoveToTarget", "../core/ReserveItems", "../other/item/MoveItem"], function (require, exports, IItem_1, Objective_1, SetContextData_1, Lambda_1, MoveToTarget_1, ReserveItems_1, MoveItem_1) {
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
                    if (item.type === this.itemType &&
                        !context.isReservedItem(item) &&
                        (this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur))) {
                        return [
                            new ReserveItems_1.default(item),
                            new SetContextData_1.default(this.contextDataKey, item),
                            new MoveItem_1.default(item, context.player.inventory),
                        ];
                    }
                }
            }
            return island.items
                .map(item => {
                if (item &&
                    item.type === this.itemType &&
                    itemManager.isTileContainer(item.containedWithin) &&
                    !context.isReservedItem(item) &&
                    (this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur))) {
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
                        objectives.push(new MoveItem_1.default(item, context.player.inventory));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEMsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUN4QixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtvQkFDekIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRO3dCQUM5QixDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO3dCQUM3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxDQUFDLElB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
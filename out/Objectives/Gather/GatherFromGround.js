define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../Objective", "../contextData/SetContextData", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../core/ReserveItems"], function (require, exports, IAction_1, IItem_1, Objective_1, SetContextData_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, ReserveItems_1) {
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
                            new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                action.execute(context.player, item, context.player.inventory);
                            }).setStatus(() => `Moving ${item.getName()} to inventory`),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXVDLEVBQUU7WUFDMUcsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUUzRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEMsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUN4QixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtvQkFDekIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRO3dCQUM5QixDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO3dCQUM3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxDQUFDLElB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
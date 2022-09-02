define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/context/IContext", "../../core/objective/Objective", "../contextData/SetContextData", "../core/Lambda", "../core/MoveToTarget", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IContext_1, Objective_1, SetContextData_1, Lambda_1, MoveToTarget_1, ReserveItems_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
            this.gatherObjectivePriority = 500;
        }
        getIdentifier(context) {
            return `GatherFromGround:${IItem_1.ItemType[this.itemType]}:${context?.getData(IContext_1.ContextDataType.PrioritizeBaseItems)}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from the ground`;
        }
        canGroupTogether() {
            return true;
        }
        canIncludeContextHashCode(context, objectiveHashCode) {
            return {
                objectiveHashCode,
                itemTypes: new Set([this.itemType]),
            };
        }
        shouldIncludeContextHashCode(context, objectiveHashCode) {
            return context.isReservedItemType(this.itemType, objectiveHashCode);
        }
        async execute(context, objectiveHashCode) {
            const prioritizeBaseItems = context.getData(IContext_1.ContextDataType.PrioritizeBaseItems);
            const point = context.human.getPoint();
            const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item));
            if (item) {
                return [
                    new ReserveItems_1.default(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
                    new MoveToTarget_1.default(item.containedWithin, false)
                        .overrideDifficulty((prioritizeBaseItems && context.utilities.item.getBaseTileItems(context).has(item)) ? 5 : undefined)
                        .trackItem(item),
                    new SetContextData_1.default(this.contextDataKey, item),
                    new MoveItemIntoInventory_1.default(item, item.containedWithin),
                ];
            }
            return context.utilities.item.getGroundItems(context, this.itemType)
                .map(item => {
                if (item && this.itemMatches(context, item)) {
                    return [
                        new ReserveItems_1.default(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
                        new MoveToTarget_1.default(item.containedWithin, true)
                            .overrideDifficulty((prioritizeBaseItems && context.utilities.item.getBaseTileItems(context).has(item)) ? 5 : undefined)
                            .trackItem(item),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new Lambda_1.default(async (context) => {
                            const objectives = [];
                            const point = context.human.getFacingPoint();
                            const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item, true));
                            if (item) {
                                objectives.push(new ReserveItems_1.default(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode));
                                objectives.push(new SetContextData_1.default(this.contextDataKey, item));
                                objectives.push(new MoveItemIntoInventory_1.default(item, point));
                            }
                            return objectives;
                        }).setStatus(this),
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
                const canCraft = item.description()?.recipe;
                if (canCraft && !item.crafterIdentifier) {
                    return false;
                }
            }
            if (this.options.willDestroyItem && !context.utilities.item.canDestroyItem(context, item)) {
                return false;
            }
            return true;
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tR3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUl0RCxZQUE2QixRQUFrQixFQUFtQixVQUF1QyxFQUFFO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7WUFGM0YsNEJBQXVCLEdBQUcsR0FBRyxDQUFDO1FBSTlDLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBNEI7WUFDaEQsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxFQUFFLE9BQU8sQ0FBQywwQkFBZSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztRQUMvRyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDO1FBQ3RHLENBQUM7UUFFZSxnQkFBZ0I7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBV2UseUJBQXlCLENBQUMsT0FBZ0IsRUFBRSxpQkFBeUI7WUFDcEYsT0FBTztnQkFDTixpQkFBaUI7Z0JBQ2pCLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuQyxDQUFDO1FBQ0gsQ0FBQztRQUVlLDRCQUE0QixDQUFDLE9BQWdCLEVBQUUsaUJBQXlCO1lBR3ZGLE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRU0sS0FB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
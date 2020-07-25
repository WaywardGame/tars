define(["require", "exports", "entity/action/IAction", "utilities/math/Vector2", "utilities/TileHelpers", "../../Context", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Base", "../../Utilities/Item", "../../Utilities/Tile", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, Vector2_1, TileHelpers_1, Context_1, IObjective_1, ITars_1, Objective_1, Base_1, Item_1, Tile_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const maxChestDistance = 128;
    class OrganizeInventory extends Objective_1.default {
        constructor(allowChests = true, force = false) {
            super();
            this.allowChests = allowChests;
            this.force = force;
        }
        getIdentifier() {
            return "OrganizeInventory";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            const reservedItems = Item_1.getReservedItems(context);
            const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            let unusedItems = Item_1.getUnusedItems(context);
            const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            if (reservedItems.length === 0 && unusedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const allowOrganizingReservedItemsIntoIntermediateChest = context.getData(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest) !== false;
            this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);
            if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
                this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);
                const objectives = this.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
                if (objectives) {
                    return objectives;
                }
            }
            if (unusedItems.length === 0 && this.force) {
                unusedItems = Item_1.getUnusedItems(context, true);
            }
            if (unusedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (!Base_1.isNearBase(context)) {
                this.log.info(`Not near base, disabling use of chests.. ${unusedItems.join(", ")}`, context.getHashCode());
                this.allowChests = false;
            }
            this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());
            if (this.allowChests && context.base.chest.length > 0) {
                const chests = context.base.chest.sort((a, b) => itemManager.computeContainerWeight(a) > itemManager.computeContainerWeight(b) ? 1 : -1);
                for (const chest of chests) {
                    if (Vector2_1.default.distance(context.player, chest) > maxChestDistance) {
                        continue;
                    }
                    const objectives = this.moveIntoChestObjectives(context, chest, unusedItems);
                    if (objectives) {
                        return objectives;
                    }
                }
            }
            const target = TileHelpers_1.default.findMatchingTile(context.player, (point, tile) => Tile_1.isOpenTile(context, point, tile) && !game.isTileFull(tile), ITars_1.defaultMaxTilesChecked);
            if (target === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemToDrop = unusedItems[0];
            this.log.info(`Dropping ${itemToDrop}`);
            return [
                new MoveToTarget_1.default(target, false),
                new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                    action.execute(context.player, itemToDrop);
                }),
            ];
        }
        moveIntoChestObjectives(context, chest, itemsToMove) {
            const targetContainer = chest;
            const weight = itemManager.computeContainerWeight(targetContainer);
            if (weight + itemsToMove[0].getTotalWeight() <= targetContainer.weightCapacity) {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, targetContainer);
                    }));
                }
                return objectives;
            }
            return undefined;
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9VdGlsaXR5L09yZ2FuaXplSW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWlCQSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQUU3QixNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUV2RCxZQUFvQixjQUF1QixJQUFJLEVBQW1CLFFBQWlCLEtBQUs7WUFDdkYsS0FBSyxFQUFFLENBQUM7WUFEVyxnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBaUI7UUFFeEYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxhQUFhLEdBQUcsdUJBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RixJQUFJLFdBQVcsR0FBRyxxQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEYsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMs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
define(["require", "exports", "game/entity/action/IAction", "utilities/game/TileHelpers", "utilities/math/Vector2", "../..//IContext", "../../IObjective", "../../ITars", "../../Objective", "../../utilities/Base", "../../utilities/Item", "../../utilities/Tile", "../core/ExecuteAction", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItem"], function (require, exports, IAction_1, TileHelpers_1, Vector2_1, IContext_1, IObjective_1, ITars_1, Objective_1, Base_1, Item_1, Tile_1, ExecuteAction_1, MoveToTarget_1, Restart_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const maxChestDistance = 128;
    class OrganizeInventory extends Objective_1.default {
        constructor(options = { allowChests: true }) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return "OrganizeInventory";
        }
        getStatus() {
            return "Organizing inventory";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            var _a, _b;
            const moveToNewIslandState = context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
            const reservedItems = Item_1.itemUtilities.getReservedItems(context)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            let unusedItems = Item_1.itemUtilities.getUnusedItems(context, { allowSailboat: moveToNewIslandState === IContext_1.MovingToNewIslandState.None })
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            if (reservedItems.length === 0 && unusedItems.length === 0 && !this.options.items) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.onlyIfNearBase && !Base_1.baseUtilities.isNearBase(context)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.items) {
                const validItems = this.options.items
                    .filter(item => itemManager.getPlayerWithItemInInventory(item) === context.player)
                    .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
                if (validItems.length === 0) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
                this.log.info("Moving items", this.options.items);
                const objectivePipelines = [];
                const chests = this.options.onlyAllowIntermediateChest ? context.base.intermediateChest : context.base.chest;
                for (const chest of chests) {
                    const objectives = OrganizeInventory.moveIntoChestObjectives(context, chest, validItems);
                    if (objectives) {
                        objectivePipelines.push(objectives);
                    }
                }
                return objectivePipelines;
            }
            const allowOrganizingReservedItemsIntoIntermediateChest = context.getData(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest) !== false;
            this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow moving reserved items: ${(_a = this.options) === null || _a === void 0 ? void 0 : _a.allowReservedItems}. Allow moving into chests: ${(_b = this.options) === null || _b === void 0 ? void 0 : _b.allowChests}. Allow moving into intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);
            if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
                this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);
                const objectives = OrganizeInventory.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
                if (objectives) {
                    return objectives;
                }
            }
            if (unusedItems.length === 0 && this.options.allowReservedItems) {
                unusedItems = Item_1.itemUtilities.getUnusedItems(context, { allowReservedItems: true });
            }
            if (unusedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());
            if (this.options.allowChests && context.base.chest.length > 0) {
                const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a) - itemManager.computeContainerWeight(b));
                for (const chest of chests) {
                    if (!this.options.disableDrop && Vector2_1.default.distance(context.player, chest) > maxChestDistance) {
                        continue;
                    }
                    const objectives = OrganizeInventory.moveIntoChestObjectives(context, chest, unusedItems);
                    if (objectives) {
                        return objectives;
                    }
                }
            }
            if (this.options.disableDrop) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const target = TileHelpers_1.default.findMatchingTile(context.player, (point, tile) => Tile_1.tileUtilities.isOpenTile(context, point, tile), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
            if (target === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemToDrop = unusedItems[0];
            this.log.info(`Dropping ${itemToDrop}`);
            return [
                new MoveToTarget_1.default(target, false),
                new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                    action.execute(context.player, itemToDrop);
                    return IObjective_1.ObjectiveResult.Complete;
                }),
            ];
        }
        static moveIntoChestsObjectives(context, itemsToMove) {
            const chests = context.base.chest.slice().concat(context.base.intermediateChest);
            for (const chest of chests) {
                const organizeInventoryObjectives = OrganizeInventory.moveIntoChestObjectives(context, chest, itemsToMove);
                if (organizeInventoryObjectives) {
                    return organizeInventoryObjectives;
                }
            }
            return undefined;
        }
        static moveIntoChestObjectives(context, chest, itemsToMove) {
            const objectives = [];
            const targetContainer = chest;
            let chestWeight = itemManager.computeContainerWeight(targetContainer);
            const chestWeightCapacity = itemManager.getWeightCapacity(targetContainer);
            if (chestWeightCapacity !== undefined && chestWeight + itemsToMove[0].getTotalWeight() <= chestWeightCapacity) {
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    const itemWeight = item.getTotalWeight();
                    if (chestWeight + itemWeight > chestWeightCapacity) {
                        break;
                    }
                    chestWeight += itemWeight;
                    objectives.push(new MoveItem_1.default(item, targetContainer));
                }
                objectives.push(new Restart_1.default());
            }
            return objectives.length > 0 ? objectives : undefined;
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L09yZ2FuaXplSW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW9CQSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQWlCN0IsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsVUFBc0MsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQ3ZGLEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQW9EO1FBRXhGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQXlCLDBCQUFlLENBQUMsaUJBQWlCLEVBQUUsaUNBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFOUksTUFBTSxhQUFhLEdBQUcsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7aUJBQzNELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUMxRCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxF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
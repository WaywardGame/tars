define(["require", "exports", "game/entity/action/IAction", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItem", "../../core/ITars"], function (require, exports, IAction_1, TileHelpers_1, Vector2_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, Restart_1, MoveItem_1, ITars_1) {
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
            const moveToNewIslandState = context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
            const reservedItems = context.utilities.item.getReservedItems(context, false)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            let unusedItems = context.utilities.item.getUnusedItems(context, { allowSailboat: moveToNewIslandState === IContext_1.MovingToNewIslandState.None })
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            if (reservedItems.length === 0 && unusedItems.length === 0 && !this.options.items) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.onlyIfNearBase && !context.utilities.base.isNearBase(context)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.items) {
                const validItems = this.options.items
                    .filter(item => context.island.items.getPlayerWithItemInInventory(item) === context.human)
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
            this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow moving reserved items: ${this.options?.allowReservedItems}. Allow moving into chests: ${this.options?.allowChests}. Allow moving into intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);
            if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
                this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);
                const objectives = OrganizeInventory.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
                if (objectives) {
                    return objectives;
                }
            }
            if (unusedItems.length === 0 && this.options.allowReservedItems) {
                unusedItems = context.utilities.item.getUnusedItems(context, { allowReservedItems: true });
            }
            if (unusedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());
            if (this.options.allowChests && context.base.chest.length > 0) {
                const chests = context.base.chest.slice().sort((a, b) => context.island.items.computeContainerWeight(a) - context.island.items.computeContainerWeight(b));
                for (const chest of chests) {
                    if (!this.options.disableDrop && Vector2_1.default.distance(context.human, chest) > maxChestDistance) {
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
            const target = TileHelpers_1.default.findMatchingTile(context.island, context.human, (_, point, tile) => context.utilities.tile.isOpenTile(context, point, tile), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
            if (target === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemToDrop = unusedItems[0];
            this.log.info(`Dropping ${itemToDrop}`);
            return [
                new MoveToTarget_1.default(target, false),
                new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                    action.execute(context.actionExecutor, itemToDrop);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(`Dropping ${itemToDrop.getName()}`),
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
            let chestWeight = context.island.items.computeContainerWeight(targetContainer);
            const chestWeightCapacity = context.island.items.getWeightCapacity(targetContainer);
            if (chestWeightCapacity !== undefined && chestWeight + itemsToMove[0].getTotalWeight() <= chestWeightCapacity) {
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    const itemWeight = item.getTotalWeight();
                    if (chestWeight + itemWeight > chestWeightCapacity) {
                        break;
                    }
                    chestWeight += itemWeight;
                    objectives.push(new MoveItem_1.default(item, targetContainer, chest));
                }
                objectives.push(new Restart_1.default());
            }
            return objectives.length > 0 ? objectives : undefined;
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L09yZ2FuaXplSW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQWlCN0IsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsVUFBK0MsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQ2hHLEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQTZEO1FBRWpHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBeUIsMEJBQWUsQ0FBQyxpQkFBaUIsRUFBRSxpQ0FBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU5SSxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2lCQUMzRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FB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
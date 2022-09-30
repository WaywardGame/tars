define(["require", "exports", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/entity/action/actions/Drop", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItem", "../../core/ITars"], function (require, exports, TileHelpers_1, Vector2_1, Drop_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, Restart_1, MoveItem_1, ITars_1) {
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
            const reservedItems = context.utilities.item.getReservedItems(context, false)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            let unusedItems = context.utilities.item.getUnusedItems(context)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);
            const itemsToBuild = context.utilities.item.getItemsToBuild(context)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            const itemsToBuildWeight = itemsToBuild.reduce((a, b) => a + b.getTotalWeight(), 0);
            if (reservedItems.length === 0 && unusedItems.length === 0 && itemsToBuild.length === 0 && !this.options.items) {
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
            this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Items to build weight: ${itemsToBuildWeight}. Allow moving reserved items: ${this.options?.allowReservedItems}. Allow moving into chests: ${this.options?.allowChests}. Allow moving into intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);
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
            if (unusedItems.length === 0 && this.options.allowInventoryItems) {
                unusedItems = unusedItems.concat(itemsToBuild);
            }
            if (unusedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());
            if (this.options.allowChests && context.base.chest.length > 0) {
                const chests = context.base.chest
                    .slice()
                    .sort((a, b) => context.island.items.computeContainerWeight(a) - context.island.items.computeContainerWeight(b));
                const facingDoodad = context.human.getFacingTile().doodad;
                if (facingDoodad && context.island.items.isContainer(facingDoodad)) {
                    const chestIndex = chests.indexOf(facingDoodad);
                    if (chestIndex !== undefined) {
                        chests.splice(chestIndex, 1);
                        chests.unshift(facingDoodad);
                    }
                }
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
                new ExecuteAction_1.default(Drop_1.default, [itemToDrop]).setStatus(`Dropping ${itemToDrop.getName()}`),
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
            if (chestWeightCapacity !== undefined && chestWeight + itemsToMove[0].getTotalWeight(undefined, targetContainer) <= chestWeightCapacity) {
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    const itemWeight = item.getTotalWeight(undefined, targetContainer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L09yZ2FuaXplSW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWtCQSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQWtCN0IsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsVUFBK0MsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQ2hHLEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQTZEO1FBRWpHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2lCQUMzRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FB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
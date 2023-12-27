/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/utilities/math/Vector2", "@wayward/game/game/entity/action/actions/Drop", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/ExecuteAction", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItems", "../../core/ITars"], function (require, exports, Vector2_1, Drop_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, Restart_1, MoveItems_1, ITars_1) {
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
                const facingDoodad = context.human.facingTile.doodad;
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
            const target = context.human.tile.findMatchingTile(tile => context.utilities.tile.isOpenTile(context, tile), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
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
                let itemsToMoveWithinWeight = [];
                for (const item of itemsToMove) {
                    const itemWeight = item.getTotalWeight(undefined, targetContainer);
                    if (chestWeight + itemWeight > chestWeightCapacity) {
                        break;
                    }
                    chestWeight += itemWeight;
                    itemsToMoveWithinWeight.push(item);
                }
                if (itemsToMoveWithinWeight.length > 0) {
                    objectives.push(new MoveItems_1.default(itemsToMoveWithinWeight, targetContainer));
                    objectives.push(new Restart_1.default());
                }
            }
            return objectives.length > 0 ? objectives : undefined;
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L09yZ2FuaXplSW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQW1CSCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQWtCN0IsTUFBcUIsaUJBQWtCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsVUFBK0MsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQ2hHLEtBQUssRUFBRSxDQUFDO1lBRG9CLFlBQU8sR0FBUCxPQUFPLENBQTZEO1FBRWpHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2lCQUMzRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMs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
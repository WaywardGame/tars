define(["require", "exports", "@wayward/goodstream/Stream", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "game/tile/Terrains", "language/Dictionary", "language/ITranslation", "language/Translation", "utilities/game/TileHelpers", "game/entity/action/actions/MoveItem", "game/entity/action/actions/Harvest", "game/entity/action/actions/Butcher", "game/entity/action/actions/Chop", "game/entity/action/actions/Dig", "game/entity/action/actions/Mine", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, Stream_1, IAction_1, IItem_1, ITerrain_1, Terrains_1, Dictionary_1, ITranslation_1, Translation_1, TileHelpers_1, MoveItem_1, Harvest_1, Butcher_1, Chop_1, Dig_1, Mine_1, IObjective_1, Objective_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecuteActionType = void 0;
    var ExecuteActionType;
    (function (ExecuteActionType) {
        ExecuteActionType[ExecuteActionType["Generic"] = 0] = "Generic";
        ExecuteActionType[ExecuteActionType["Doodad"] = 1] = "Doodad";
        ExecuteActionType[ExecuteActionType["Terrain"] = 2] = "Terrain";
        ExecuteActionType[ExecuteActionType["Corpse"] = 3] = "Corpse";
    })(ExecuteActionType = exports.ExecuteActionType || (exports.ExecuteActionType = {}));
    class ExecuteActionForItem extends Objective_1.default {
        constructor(type, itemTypes, options) {
            super();
            this.type = type;
            this.options = options;
            this.includeUniqueIdentifierInHashCode = true;
            this.itemTypes = !(itemTypes instanceof Set) ? new Set(itemTypes) : itemTypes;
        }
        getIdentifier() {
            return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.options?.genericAction !== undefined ? `:${IAction_1.ActionType[this.options.genericAction.action.type]}` : ""}`;
        }
        getStatus() {
            const translation = Stream_1.default.values(Array.from(this.itemTypes).map(itemType => Translation_1.default.nameOf(Dictionary_1.default.Item, itemType)))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Acquiring ${translation.getString()}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            context.setData(this.contextDataKey, undefined);
            if (context.calculatingDifficulty) {
                return 0;
            }
            const tile = context.human.getFacingTile();
            const facingPoint = context.human.getFacingPoint();
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            let result;
            switch (this.type) {
                case ExecuteActionType.Doodad: {
                    const doodad = tile.doodad;
                    if (!doodad) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const description = doodad.description();
                    if (!description) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    if (!context.utilities.tile.canGather(context, tile, true)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const action = doodad.canHarvest() ? Harvest_1.default : doodad.isGatherable() ? Chop_1.default : undefined;
                    if (!action || (this.options?.onlyAllowHarvesting && action !== Harvest_1.default)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    result = await this.executeActionForItem(context, this.itemTypes, {
                        action,
                        args: [this.options?.onlyGatherWithHands ? undefined : context.utilities.item.getBestToolForDoodadGather(context, doodad)]
                    });
                    break;
                }
                case ExecuteActionType.Terrain:
                    if (this.options?.expectedTerrainType !== undefined && this.options.expectedTerrainType !== tileType) {
                        this.log.debug(`Terrain type changed from ${ITerrain_1.TerrainType[this.options.expectedTerrainType]} to ${ITerrain_1.TerrainType[tileType]}`);
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const action = terrainDescription.gather ? Mine_1.default : Dig_1.default;
                    if (action === Dig_1.default && !context.utilities.tile.canDig(context, facingPoint)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    result = await this.executeActionForItem(context, this.itemTypes, {
                        action,
                        args: [context.utilities.item.getBestToolForTerrainGather(context, tileType)]
                    });
                    break;
                case ExecuteActionType.Corpse:
                    const tool = context.inventory.butcher;
                    if (tool === undefined || !context.utilities.tile.canButcherCorpse(context, facingPoint, tool)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    result = await this.executeActionForItem(context, this.itemTypes, { action: Butcher_1.default, args: [tool] });
                    break;
                case ExecuteActionType.Generic:
                    if (this.options?.genericAction === undefined) {
                        this.log.error("Invalid action");
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    result = await this.executeActionForItem(context, this.itemTypes, this.options.genericAction);
                    break;
                default:
                    return IObjective_1.ObjectiveResult.Complete;
            }
            return result;
        }
        getBaseDifficulty(context) {
            return 1;
        }
        async executeActionForItem(context, itemTypes, action) {
            let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, action);
            if (typeof (matchingNewItem) === "number") {
                return matchingNewItem;
            }
            if (matchingNewItem !== undefined) {
                this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}, data key: ${this.contextDataKey})`);
                if (this.reserveType === ITars_1.ReserveType.Soft) {
                    context.addSoftReservedItems(matchingNewItem);
                }
                else {
                    context.addHardReservedItems(matchingNewItem);
                }
                context.setData(this.contextDataKey, matchingNewItem);
                return IObjective_1.ObjectiveResult.Complete;
            }
            const matchingTileItems = context.human.getTile().containedItems?.filter(item => itemTypes.has(item.type));
            if (matchingTileItems !== undefined && matchingTileItems.length > 0) {
                const matchingNewItems = [];
                for (let i = 0; i < (this.options?.moveAllMatchingItems ? matchingTileItems.length : 1); i++) {
                    const itemToMove = matchingTileItems[i];
                    const targetContainer = context.utilities.item.getMoveItemToInventoryTarget(context, itemToMove);
                    const matchingItem = await this.executeActionCompareInventoryItems(context, itemTypes, { action: MoveItem_1.default, args: [itemToMove, targetContainer] });
                    if (typeof (matchingItem) === "number") {
                        this.log.warn("Issue moving items", IObjective_1.ObjectiveResult[matchingItem]);
                        return matchingItem;
                    }
                    if (matchingItem !== undefined) {
                        matchingNewItems.push(matchingItem);
                    }
                }
                if (matchingNewItems.length > 0) {
                    const matchingNewItem = matchingNewItems[0];
                    this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}, data key: ${this.contextDataKey}) (via MoveItem)`);
                    if (this.reserveType === ITars_1.ReserveType.Soft) {
                        context.addSoftReservedItems(...matchingNewItems);
                    }
                    else {
                        context.addHardReservedItems(...matchingNewItems);
                    }
                    context.setData(this.contextDataKey, matchingNewItem);
                    return IObjective_1.ObjectiveResult.Complete;
                }
            }
            context.setData(this.contextDataKey, undefined);
            return this.options?.preRetry?.(context) ?? IObjective_1.ObjectiveResult.Pending;
        }
        async executeActionCompareInventoryItems(context, itemTypes, action) {
            const itemsBefore = new Map(context.utilities.item.getItemsInInventory(context).map(item => ([item.id, item.type])));
            const result = await context.utilities.action.executeAction(context, action.action, action.args, action.expectedMessages);
            if (result !== IObjective_1.ObjectiveResult.Complete) {
                return result;
            }
            const newOrChangedItems = context.utilities.item.getItemsInInventory(context).filter(item => {
                const beforeItemType = itemsBefore.get(item.id);
                return beforeItemType === undefined || beforeItemType !== item.type;
            });
            return newOrChangedItems.find(item => itemTypes.has(item.type));
        }
    }
    exports.default = ExecuteActionForItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUEwQkEsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7SUFxQkQsTUFBcUIsb0JBQXFELFNBQVEsbUJBQVM7UUFNMUYsWUFDa0IsSUFBdUIsRUFDeEMsU0FBcUMsRUFDcEIsT0FBa0Q7WUFDbkUsS0FBSyxFQUFFLENBQUM7WUFIUyxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUV2QixZQUFPLEdBQVAsT0FBTyxDQUEyQztZQVB4QyxzQ0FBaUMsR0FBWSxJQUFJLENBQUM7WUFVN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQy9FLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDNUssQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENB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
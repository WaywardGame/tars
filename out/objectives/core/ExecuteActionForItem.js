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
define(["require", "exports", "@wayward/goodstream/Stream", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/item/IItem", "@wayward/game/game/tile/ITerrain", "@wayward/game/language/Dictionary", "@wayward/game/language/ITranslation", "@wayward/game/language/Translation", "@wayward/game/game/entity/action/actions/Harvest", "@wayward/game/game/entity/action/actions/Butcher", "@wayward/game/game/entity/action/actions/Chop", "@wayward/game/game/entity/action/actions/Dig", "@wayward/game/game/entity/action/actions/Mine", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, Stream_1, IAction_1, IItem_1, ITerrain_1, Dictionary_1, ITranslation_1, Translation_1, Harvest_1, Butcher_1, Chop_1, Dig_1, Mine_1, IObjective_1, Objective_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecuteActionType = void 0;
    var ExecuteActionType;
    (function (ExecuteActionType) {
        ExecuteActionType[ExecuteActionType["Generic"] = 0] = "Generic";
        ExecuteActionType[ExecuteActionType["Doodad"] = 1] = "Doodad";
        ExecuteActionType[ExecuteActionType["Terrain"] = 2] = "Terrain";
        ExecuteActionType[ExecuteActionType["Corpse"] = 3] = "Corpse";
    })(ExecuteActionType || (exports.ExecuteActionType = ExecuteActionType = {}));
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
            const tile = context.human.facingTile;
            const tileType = tile.type;
            const terrainDescription = tile.description;
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
                    const description = doodad.description;
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
                    if (action === Dig_1.default && !context.utilities.tile.canDig(context, tile)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    result = await this.executeActionForItem(context, this.itemTypes, {
                        action,
                        args: [context.utilities.item.getBestToolForTerrainGather(context, tileType)]
                    });
                    break;
                case ExecuteActionType.Corpse:
                    const tool = context.inventory.butcher;
                    if (tool === undefined || !context.utilities.tile.canButcherCorpse(context, tile, tool)) {
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
            const matchingTileItems = context.human.tile.containedItems?.filter(item => itemTypes.has(item.type));
            if (matchingTileItems !== undefined && matchingTileItems.length > 0) {
                const matchingNewItems = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUEwQkgsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFLNUI7SUFxQkQsTUFBcUIsb0JBQXFELFNBQVEsbUJBQVM7UUFNMUYsWUFDa0IsSUFBdUIsRUFDeEMsU0FBcUMsRUFDcEIsT0FBa0Q7WUFDbkUsS0FBSyxFQUFFLENBQUM7WUFIUyxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUV2QixZQUFPLEdBQVAsT0FBTyxDQUEyQztZQVB4QyxzQ0FBaUMsR0FBWSxJQUFJLENBQUM7WUFVN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQy9FLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDNUssQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxL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
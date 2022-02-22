define(["require", "exports", "@wayward/goodstream/Stream", "game/entity/action/IAction", "game/item/IItem", "game/tile/Terrains", "language/Dictionary", "language/ITranslation", "language/Translation", "utilities/game/TileHelpers", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, Stream_1, IAction_1, IItem_1, Terrains_1, Dictionary_1, ITranslation_1, Translation_1, TileHelpers_1, IObjective_1, Objective_1, ITars_1) {
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
            this.itemTypes = itemTypes;
            this.options = options;
        }
        getIdentifier() {
            return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.options?.actionType !== undefined ? `:${IAction_1.ActionType[this.options.actionType]}` : ""}`;
        }
        getStatus() {
            if (this.itemTypes.length > 1) {
                const translation = Stream_1.default.values(Array.from(new Set(this.itemTypes)).map(itemType => Translation_1.default.nameOf(Dictionary_1.default.Item, itemType)))
                    .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
                return `Acquiring ${translation.getString()}`;
            }
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemTypes[0]).getString()}`;
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
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (this.terrainTileType === undefined) {
                this.terrainTileType = tileType;
            }
            else if (this.terrainTileType !== tileType) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            let actionType;
            const actionArguments = [];
            switch (this.type) {
                case ExecuteActionType.Doodad:
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
                    if (doodad.canHarvest()) {
                        actionType = IAction_1.ActionType.Harvest;
                    }
                    else if (doodad.isGatherable()) {
                        actionType = IAction_1.ActionType.Chop;
                    }
                    else {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    if (this.options?.onlyAllowHarvesting && actionType !== IAction_1.ActionType.Harvest) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    if (this.options?.onlyGatherWithHands) {
                        actionArguments.push(undefined, true);
                    }
                    else {
                        actionArguments.push(context.utilities.item.getBestToolForDoodadGather(context, doodad));
                    }
                    break;
                case ExecuteActionType.Terrain:
                    actionType = terrainDescription.gather ? IAction_1.ActionType.Mine : IAction_1.ActionType.Dig;
                    if (actionType === IAction_1.ActionType.Dig && !context.utilities.tile.canDig(context, tile)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    actionArguments.push(context.utilities.item.getBestToolForTerrainGather(context, tileType));
                    break;
                case ExecuteActionType.Corpse:
                    const tool = context.utilities.item.getBestTool(context, IAction_1.ActionType.Butcher);
                    if (tool === undefined || !context.utilities.tile.canButcherCorpse(context, tile)) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    actionType = IAction_1.ActionType.Butcher;
                    actionArguments.push(tool);
                    break;
                case ExecuteActionType.Generic:
                    if (this.options?.actionType === undefined) {
                        this.log.error("Invalid action type");
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    actionType = this.options.actionType;
                    break;
                default:
                    return IObjective_1.ObjectiveResult.Complete;
            }
            const result = await this.executeActionForItem(context, this.itemTypes, actionType, ((context, action) => {
                if (this.options?.executor) {
                    this.options.executor(context, action);
                }
                else {
                    action.execute(context.actionExecutor, ...actionArguments);
                }
            }));
            if (this.type === ExecuteActionType.Generic) {
                return result === IObjective_1.ObjectiveResult.Complete ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Restart;
            }
            return result;
        }
        getBaseDifficulty(context) {
            return 1;
        }
        async executeActionForItem(context, itemTypes, actionType, executor) {
            let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, actionType, executor);
            if (matchingNewItem !== undefined) {
                this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id})`);
                if (this.reserveType === ITars_1.ReserveType.Soft) {
                    context.addSoftReservedItems(matchingNewItem);
                }
                else {
                    context.addHardReservedItems(matchingNewItem);
                }
                context.setData(this.contextDataKey, matchingNewItem);
                return IObjective_1.ObjectiveResult.Complete;
            }
            const item = context.human.getTile().containedItems?.find(item => itemTypes.includes(item.type));
            if (item) {
                matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, IAction_1.ActionType.MoveItem, ((context, action) => {
                    action.execute(context.actionExecutor, item, context.human.inventory);
                }));
                if (matchingNewItem !== undefined) {
                    this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}) (via MoveItem)`);
                    if (this.reserveType === ITars_1.ReserveType.Soft) {
                        context.addSoftReservedItems(matchingNewItem);
                    }
                    else {
                        context.addHardReservedItems(matchingNewItem);
                    }
                    context.setData(this.contextDataKey, matchingNewItem);
                    return IObjective_1.ObjectiveResult.Complete;
                }
            }
            context.setData(this.contextDataKey, undefined);
            return IObjective_1.ObjectiveResult.Pending;
        }
        async executeActionCompareInventoryItems(context, itemTypes, actionType, executor) {
            const itemsBefore = context.human.inventory.containedItems.slice();
            await context.utilities.action.executeAction(context, actionType, executor);
            const newItems = context.human.inventory.containedItems.filter(item => !itemsBefore.includes(item));
            return newItems.find(item => itemTypes.includes(item.type));
        }
    }
    exports.default = ExecuteActionForItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFrQkEsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7SUFVRCxNQUFxQixvQkFBMkMsU0FBUSxtQkFBUztRQUloRixZQUNrQixJQUF1QixFQUN2QixTQUFxQixFQUNyQixPQUFrRDtZQUNuRSxLQUFLLEVBQUUsQ0FBQztZQUhTLFNBQUksR0FBSixJQUFJLENBQW1CO1lBQ3ZCLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBMkM7UUFFcEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDekosQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFB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
define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/Terrains", "language/Dictionaries", "language/Translation", "utilities/game/TileHelpers", "../../IObjective", "../../Objective", "../../utilities/Action", "../../utilities/Item", "../../utilities/Tile"], function (require, exports, IAction_1, IItem_1, Terrains_1, Dictionaries_1, Translation_1, TileHelpers_1, IObjective_1, Objective_1, Action_1, Item_1, Tile_1) {
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
        constructor(type, itemTypes, actionType, executor) {
            super();
            this.type = type;
            this.itemTypes = itemTypes;
            this.actionType = actionType;
            this.executor = executor;
        }
        getIdentifier() {
            return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.actionType !== undefined ? `:${IAction_1.ActionType[this.actionType]}` : ""}`;
        }
        getStatus() {
            if (this.itemTypes.length > 1) {
                const translation = Stream.values(Array.from(new Set(this.itemTypes)).map(itemType => Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, itemType)))
                    .collect(Translation_1.default.formatList, Translation_1.ListEnder.Or);
                return `Acquiring ${translation.getString()}`;
            }
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemTypes[0]).getString()}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            const tile = context.player.getFacingTile();
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (this.terrainTileType === undefined) {
                this.terrainTileType = tileType;
            }
            else if (this.terrainTileType !== tileType) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            let actionType;
            const actionArguments = [];
            switch (this.type) {
                case ExecuteActionType.Doodad:
                    const doodad = tile.doodad;
                    if (!doodad) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    const description = doodad.description();
                    if (!description) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    if (!Tile_1.tileUtilities.canGather(tile, true)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    const stage = doodad.getGrowingStage();
                    if (stage !== undefined && description.harvest && description.harvest[stage]) {
                        actionType = IAction_1.ActionType.Harvest;
                    }
                    else {
                        actionType = IAction_1.ActionType.Gather;
                    }
                    actionArguments.push(Item_1.itemUtilities.getBestToolForDoodadGather(context, doodad));
                    break;
                case ExecuteActionType.Terrain:
                    actionType = terrainDescription.gather ? IAction_1.ActionType.Gather : IAction_1.ActionType.Dig;
                    if (actionType === IAction_1.ActionType.Dig && !Tile_1.tileUtilities.canDig(tile)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    actionArguments.push(Item_1.itemUtilities.getBestToolForTerrainGather(context, tileType));
                    break;
                case ExecuteActionType.Corpse:
                    const carveTool = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Carve);
                    if (carveTool === undefined || !Tile_1.tileUtilities.canCarveCorpse(tile)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    actionType = IAction_1.ActionType.Carve;
                    actionArguments.push(carveTool);
                    break;
                case ExecuteActionType.Generic:
                    if (this.actionType === undefined) {
                        this.log.error("Invalid action type");
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    actionType = this.actionType;
                    break;
                default:
                    return IObjective_1.ObjectiveResult.Complete;
            }
            const result = await this.executeActionForItem(context, this.itemTypes, actionType, ((context, action) => {
                if (this.executor) {
                    this.executor(context, action);
                }
                else {
                    action.execute(context.player, ...actionArguments);
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
            var _a;
            let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, actionType, executor);
            if (matchingNewItem !== undefined) {
                this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id})`);
                context.setData(this.contextDataKey, matchingNewItem);
                context.addReservedItems(matchingNewItem);
                return IObjective_1.ObjectiveResult.Complete;
            }
            const item = (_a = context.player.getTile().containedItems) === null || _a === void 0 ? void 0 : _a.find(item => itemTypes.includes(item.type));
            if (item) {
                matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, IAction_1.ActionType.MoveItem, ((context, action) => {
                    action.execute(context.player, item, context.player.inventory);
                }));
                if (matchingNewItem !== undefined) {
                    this.log.info(`Acquired matching item ${IItem_1.ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}) (via MoveItem)`);
                    context.setData(this.contextDataKey, matchingNewItem);
                    context.addReservedItems(matchingNewItem);
                    return IObjective_1.ObjectiveResult.Complete;
                }
            }
            return IObjective_1.ObjectiveResult.Pending;
        }
        async executeActionCompareInventoryItems(context, itemTypes, actionType, executor) {
            const itemsBefore = context.player.inventory.containedItems.slice();
            await Action_1.actionUtilities.executeAction(context, actionType, executor);
            const newItems = context.player.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);
            return newItems.find(item => itemTypes.includes(item.type));
        }
    }
    exports.default = ExecuteActionForItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFpQkEsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7SUFFRCxNQUFxQixvQkFBMkMsU0FBUSxtQkFBUztRQUloRixZQUNrQixJQUF1QixFQUN2QixTQUFxQixFQUNyQixVQUFjLEVBQ2QsUUFBcUw7WUFDdE0sS0FBSyxFQUFFLENBQUM7WUFKUyxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUN2QixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQ3JCLGVBQVUsR0FBVixVQUFVLENBQUk7WUFDZCxhQUFRLEdBQVIsUUFBUSxDQUE2SztRQUV2TSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEksQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMs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
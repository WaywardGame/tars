define(["require", "exports", "entity/action/IAction", "entity/IEntity", "item/IItem", "tile/Terrains", "utilities/TileHelpers", "../../IObjective", "../../Objective", "../../Utilities/Action", "../../Utilities/Item", "../../Utilities/Tile"], function (require, exports, IAction_1, IEntity_1, IItem_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, Action_1, Item_1, Tile_1) {
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
                    const stage = doodad.getGrowingStage();
                    if (stage !== undefined && description.harvest && description.harvest[stage]) {
                        actionType = IAction_1.ActionType.Harvest;
                    }
                    else {
                        actionType = IAction_1.ActionType.Gather;
                    }
                    actionArguments.push(Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing));
                    break;
                case ExecuteActionType.Terrain:
                    actionType = terrainDescription.gather ? IAction_1.ActionType.Gather : IAction_1.ActionType.Dig;
                    actionArguments.push(terrainDescription.gather ? Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Blunt) : Item_1.getBestActionItem(context, IAction_1.ActionType.Dig));
                    if (actionType === IAction_1.ActionType.Dig && !Tile_1.canDig(tile)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    break;
                case ExecuteActionType.Corpse:
                    const carveTool = Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Carve);
                    if (carveTool.length === 0 || !Tile_1.canCarveCorpse(tile)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    actionType = IAction_1.ActionType.Carve;
                    actionArguments.push(carveTool[0]);
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
            await Action_1.executeAction(context, actionType, executor);
            const newItems = context.player.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);
            return newItems.find(item => itemTypes.includes(item.type));
        }
    }
    exports.default = ExecuteActionForItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9Db3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFnQkEsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7SUFFRCxNQUFxQixvQkFBMkMsU0FBUSxtQkFBUztRQUloRixZQUNrQixJQUF1QixFQUN2QixTQUFxQixFQUNyQixVQUFjLEVBQ2QsUUFBdUs7WUFDeEwsS0FBSyxFQUFFLENBQUM7WUFKUyxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUN2QixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQ3JCLGVBQVUsR0FBVixVQUFVLENBQUk7WUFDZCxhQUFRLEdBQVIsUUFBUSxDQUErSjtRQUV6TCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEksQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZ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
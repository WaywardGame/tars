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
            context.setData(this.contextDataKey, undefined);
            if (context.calculatingDifficulty) {
                return 0;
            }
            const tile = context.player.getFacingTile();
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
                    if (!Tile_1.tileUtilities.canGather(tile, true)) {
                        return IObjective_1.ObjectiveResult.Restart;
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
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    actionArguments.push(Item_1.itemUtilities.getBestToolForTerrainGather(context, tileType));
                    break;
                case ExecuteActionType.Corpse:
                    const carveTool = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Carve);
                    if (carveTool === undefined || !Tile_1.tileUtilities.canCarveCorpse(tile)) {
                        return IObjective_1.ObjectiveResult.Restart;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbkZvckl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb3JlL0V4ZWN1dGVBY3Rpb25Gb3JJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFpQkEsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLCtEQUFPLENBQUE7UUFDUCw2REFBTSxDQUFBO1FBQ04sK0RBQU8sQ0FBQTtRQUNQLDZEQUFNLENBQUE7SUFDUCxDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7SUFFRCxNQUFxQixvQkFBMkMsU0FBUSxtQkFBUztRQUloRixZQUNrQixJQUF1QixFQUN2QixTQUFxQixFQUNyQixVQUFjLEVBQ2QsUUFBcUw7WUFDdE0sS0FBSyxFQUFFLENBQUM7WUFKUyxTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUN2QixjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQ3JCLGVBQVUsR0FBVixVQUFVLENBQUk7WUFDZCxhQUFRLEdBQVIsUUFBUSxDQUE2SztRQUV2TSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEksQ0FBQztRQUVNLFNBQVM7WUFDZixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7cUJBQ25JLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx1QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVoRCxPQUFPLGFBQWEsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7YUFDOUM7WUFFRCxPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDMUYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBRXBDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVoRCxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO2FBRWhDO2lCQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxRQUFRLEVBQUU7Z0JBRTdDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxJQUFJLFVBQXNCLENBQUM7WUFDM0IsTUFBTSxlQUFlLEdBQVUsRUFBRSxDQUFDO1lBRWxDLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDbEIsS0FBSyxpQkFBaUIsQ0FBQyxNQUFNO29CQUM1QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUMzQixJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDakIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQkFDL0I7b0JBRUQsSUFBSSxDQUFDLG9CQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDekMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQkFDL0I7b0JBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN2QyxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUM3RSxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxPQUFPLENBQUM7cUJBRWhDO3lCQUFNO3dCQUNOLFVBQVUsR0FBRyxvQkFBVSxDQUFDLE1BQU0sQ0FBQztxQkFDL0I7b0JBRUQsZUFBZSxDQUFDLElBQUksQ0FBQyxvQkFBYSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUVoRixNQUFNO2dCQUVQLEtBQUssaUJBQWlCLENBQUMsT0FBTztvQkFDN0IsVUFBVSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDO29CQUU1RSxJQUFJLFVBQVUsS0FBSyxvQkFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNqRSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO3FCQUMvQjtvQkFFRCxlQUFlLENBQUMsSUFBSSxDQUFDLG9CQUFhLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBRW5GLE1BQU07Z0JBRVAsS0FBSyxpQkFBaUIsQ0FBQyxNQUFNO29CQUM1QixNQUFNLFNBQVMsR0FBRyxvQkFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFdkUsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLENBQUMsb0JBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ25FLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELFVBQVUsR0FBRyxvQkFBVSxDQUFDLEtBQUssQ0FBQztvQkFDOUIsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFaEMsTUFBTTtnQkFFUCxLQUFLLGlCQUFpQixDQUFDLE9BQU87b0JBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7cUJBQ2xDO29CQUVELFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUM3QixNQUFNO2dCQUVQO29CQUNDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDakM7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQWdCLEVBQUUsTUFBVyxFQUFFLEVBQUU7Z0JBQ3RILElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBRS9CO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLGVBQWUsQ0FBQyxDQUFDO2lCQUNuRDtZQUNGLENBQUMsQ0FBUSxDQUFDLENBQUM7WUFHWCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQWlCLENBQUMsT0FBTyxFQUFFO2dCQUU1QyxPQUFPLE1BQU0sS0FBSyw0QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2hHO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDM0MsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUNqQyxPQUFnQixFQUNoQixTQUFxQixFQUNyQixVQUFhLEVBQ2IsUUFBa0w7O1lBQ2xMLElBQUksZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQWUsQ0FBQyxDQUFDO1lBQ3JILElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLGdCQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLGVBQWUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQ3RELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sSUFBSSxHQUFHLE1BQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLDBDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEcsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQWdCLEVBQUUsTUFBVyxFQUFFLEVBQUU7b0JBQzNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixnQkFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxlQUFlLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO29CQUNySCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQ3RELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7YUFDRDtZQUVELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7UUFDaEMsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQ0FBa0MsQ0FDL0MsT0FBZ0IsRUFDaEIsU0FBcUIsRUFDckIsVUFBYSxFQUNiLFFBQWtMO1lBQ2xMLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVwRSxNQUFNLHdCQUFlLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBZSxDQUFDLENBQUM7WUFFMUUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxRyxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FDRDtJQTNMRCx1Q0EyTEMifQ==
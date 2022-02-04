define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "game/tile/Terrains", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../contextData/SetContextData", "../../core/MoveToTarget", "../tile/DigTile", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../analyze/AnalyzeInventory", "../../core/Lambda"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Terrains_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, MoveToTarget_1, DigTile_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, AnalyzeInventory_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class PlantSeed extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `PlantSeed:${this.item}`;
        }
        getStatus() {
            return `Planting ${this.item?.getName()}`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid()) {
                this.log.error("Invalid seed item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const allowedTiles = Doodads_1.default[item.description()?.onUse?.[IAction_1.ActionType.Plant]]?.allowedTiles;
            if (!allowedTiles) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const allowedTilesSet = new Set(allowedTiles);
            const objectives = [
                new ReserveItems_1.default(item).keepInInventory(),
                new MoveItemIntoInventory_1.default(item),
            ];
            if (context.inventory.hoe) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe).setContextDataKey(IContext_1.ContextDataType.Item1), new AnalyzeInventory_1.default());
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(context.island, context.utilities.base.getBasePosition(context), (island, point, tile) => {
                const tileContainer = tile;
                return island.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(island, point, tile) &&
                    island.isTilled(point.x, point.y, point.z) &&
                    allowedTiles.includes(TileHelpers_1.default.getType(tile)) &&
                    (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
            }, { maxTilesChecked: exports.gardenMaxTilesChecked });
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true));
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(context.island, context.utilities.base.getBasePosition(context), (_, point, tile) => {
                    if (tile.creature || tile.npc) {
                        return false;
                    }
                    const tileType = TileHelpers_1.default.getType(tile);
                    if (tileType === ITerrain_1.TerrainType.Grass) {
                        if (!context.utilities.tile.canDig(context, tile)) {
                            return false;
                        }
                        if (!allowedTilesSet.has(ITerrain_1.TerrainType.Dirt)) {
                            return false;
                        }
                    }
                    else {
                        if (!allowedTilesSet.has(tileType)) {
                            return false;
                        }
                        const terrainDescription = Terrains_1.default[tileType];
                        if (!terrainDescription?.tillable) {
                            return false;
                        }
                    }
                    return context.utilities.base.isOpenArea(context, point, tile);
                }, {
                    maxTilesChecked: exports.gardenMaxTilesChecked,
                    maxTiles: 1,
                });
                if (nearbyTillableTile.length === 0) {
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                const { tile, point } = nearbyTillableTile[0];
                if (TileHelpers_1.default.getType(tile) === ITerrain_1.TerrainType.Grass) {
                    objectives.push(new DigTile_1.default(point, { digUntilTypeIsNot: ITerrain_1.TerrainType.Grass }));
                }
                objectives.push(new MoveToTarget_1.default(point, true), new UseItem_1.default(IAction_1.ActionType.Till).setContextDataKey(IContext_1.ContextDataType.Item1), new Lambda_1.default(async (context) => {
                    const facingPoint = context.human.getFacingPoint();
                    if (context.human.island.isTilled(facingPoint.x, facingPoint.y, facingPoint.z)) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    this.log.warn("Not tilled yet");
                    return IObjective_1.ObjectiveResult.Restart;
                }));
            }
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Plant, item));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXlCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxZQUFZLEdBQUcsaUJBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFFLENBQUMsRUFBRSxZQUFZLENBQUM7WUFDdEcsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTlDLE1BQU0sVUFB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
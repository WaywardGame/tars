define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "game/tile/Terrains", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../contextData/SetContextData", "../../core/MoveToTarget", "../tile/DigTile", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../analyze/AnalyzeInventory", "../../core/Lambda", "../tile/ClearTile"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Terrains_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, MoveToTarget_1, DigTile_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, AnalyzeInventory_1, Lambda_1, ClearTile_1) {
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
                return island.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(island, point, tile) &&
                    island.isTilled(point.x, point.y, point.z) &&
                    allowedTiles.includes(TileHelpers_1.default.getType(tile));
            }, { maxTilesChecked: exports.gardenMaxTilesChecked });
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true), new ClearTile_1.default(emptyTilledTile));
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
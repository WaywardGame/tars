define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../contextData/SetContextData", "../../core/MoveToTarget", "../tile/DigTile", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../analyze/AnalyzeInventory", "../../core/Lambda", "../tile/ClearTile"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, MoveToTarget_1, DigTile_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, AnalyzeInventory_1, Lambda_1, ClearTile_1) {
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
                let tile;
                let point;
                const facingTile = context.human.getFacingTile();
                const facingPoint = context.human.getFacingPoint();
                if (context.utilities.tile.canTill(context, facingPoint, facingTile, allowedTilesSet)) {
                    tile = facingTile;
                    point = facingPoint;
                }
                else {
                    const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(context.island, context.utilities.base.getBasePosition(context), (_, point, tile) => context.utilities.tile.canTill(context, point, tile, allowedTilesSet), {
                        maxTilesChecked: exports.gardenMaxTilesChecked,
                        maxTiles: 1,
                    });
                    if (nearbyTillableTile.length === 0) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    const target = nearbyTillableTile[0];
                    tile = target.tile;
                    point = target.point;
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXdCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxZQUFZLEdBQUcsaUJBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFFLENBQUMsRUFBRSxZQUFZLENBQUM7WUFDdEcsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTlDLE1BQU0sVUFB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
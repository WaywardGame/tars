define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "../../../IContext", "../../../IObjective", "../../../Objective", "../../../utilities/Base", "../../../utilities/Tile", "../../acquire/item/AcquireItem", "../../contextData/CopyContextData", "../../contextData/SetContextData", "../../core/MoveToTarget", "../../core/Restart", "../tile/DigTile", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, IContext_1, IObjective_1, Objective_1, Base_1, Tile_1, AcquireItem_1, CopyContextData_1, SetContextData_1, MoveToTarget_1, Restart_1, DigTile_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class PlantSeed extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
        }
        getIdentifier() {
            return `PlantSeed:${this.seed}`;
        }
        getStatus() {
            var _a;
            return `Planting ${(_a = this.seed) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a, _b, _c, _d;
            const seed = (_a = this.seed) !== null && _a !== void 0 ? _a : context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!seed) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const allowedTiles = (_d = Doodads_1.default[(_c = (_b = seed.description()) === null || _b === void 0 ? void 0 : _b.onUse) === null || _c === void 0 ? void 0 : _c[IAction_1.ActionType.Plant]]) === null || _d === void 0 ? void 0 : _d.allowedTiles;
            if (!allowedTiles) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            if (context.inventory.hoe === undefined) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe));
                objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, IContext_1.ContextDataType.Item1));
            }
            else {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(Base_1.baseUtilities.getBasePosition(context), (point, tile) => {
                const tileContainer = tile;
                return game.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(point, tile) &&
                    TileHelpers_1.default.isTilled(tile) &&
                    allowedTiles.includes(TileHelpers_1.default.getType(tile)) &&
                    (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
            }, { maxTilesChecked: exports.gardenMaxTilesChecked });
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true));
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(Base_1.baseUtilities.getBasePosition(context), (point, tile) => {
                    const tileType = TileHelpers_1.default.getType(tile);
                    if (tileType === ITerrain_1.TerrainType.Grass && !Tile_1.tileUtilities.canDig(tile)) {
                        return false;
                    }
                    return allowedTiles.includes(tileType) && Base_1.baseUtilities.isOpenArea(context, point, tile);
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
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.Item1, IContext_1.ContextDataType.LastAcquiredItem));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Till));
                objectives.push(new Restart_1.default());
            }
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Plant, seed));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXNCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyxZQUFZLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFlBQVksR0FBRyxNQUFBLGlCQUFrQixDQUFDLE1BQUEsTUFBQSxJQUFJLENBQUMsV0FBVyxFQUFFLDBDQUFFLEtBQUssMENBQUcsb0JBQVUsQ0FBQyxLQUFLLENBQUUsQ0FBQywwQ0FBRSxZQUFZLENBQUM7WUFDdEcsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLFVBQVUs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
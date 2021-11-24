define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "game/tile/Terrains", "../../../IContext", "../../../IObjective", "../../../Objective", "../../../utilities/Base", "../../../utilities/Tile", "../../acquire/item/AcquireItem", "../../contextData/CopyContextData", "../../contextData/SetContextData", "../../core/MoveToTarget", "../../core/Restart", "../tile/DigTile", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Terrains_1, IContext_1, IObjective_1, Objective_1, Base_1, Tile_1, AcquireItem_1, CopyContextData_1, SetContextData_1, MoveToTarget_1, Restart_1, DigTile_1, UseItem_1) {
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
                this.log.error("Invalid seed item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const allowedTiles = (_d = Doodads_1.default[(_c = (_b = seed.description()) === null || _b === void 0 ? void 0 : _b.onUse) === null || _c === void 0 ? void 0 : _c[IAction_1.ActionType.Plant]]) === null || _d === void 0 ? void 0 : _d.allowedTiles;
            if (!allowedTiles) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const allowedTilesSet = new Set(allowedTiles);
            const objectives = [];
            if (context.inventory.hoe === undefined) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe));
                objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, IContext_1.ContextDataType.Item1));
            }
            else {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(context.island, Base_1.baseUtilities.getBasePosition(context), (island, point, tile) => {
                const tileContainer = tile;
                return island.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(island, point, tile) &&
                    TileHelpers_1.default.isTilled(tile) &&
                    allowedTiles.includes(TileHelpers_1.default.getType(tile)) &&
                    (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
            }, { maxTilesChecked: exports.gardenMaxTilesChecked });
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true));
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(context.island, Base_1.baseUtilities.getBasePosition(context), (_, point, tile) => {
                    if (tile.creature || tile.npc) {
                        return false;
                    }
                    const tileType = TileHelpers_1.default.getType(tile);
                    if (tileType === ITerrain_1.TerrainType.Grass) {
                        if (!Tile_1.tileUtilities.canDig(context, tile)) {
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
                        if (!(terrainDescription === null || terrainDescription === void 0 ? void 0 : terrainDescription.tillable)) {
                            return false;
                        }
                    }
                    return Base_1.baseUtilities.isOpenArea(context, point, tile);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXVCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyxZQUFZLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFlBQVksR0FBRyxNQUFBLGlCQUFrQixDQUFDLE1BQUEsTUFBQSxJQUFJLENBQUMsV0FBVyxFQUFFLDBDQUFFLEtBQUssMENBQUcsb0JBQVUsQ0FBQyxLQUFLLENBQUUsQ0FBQywwQ0FBRSxZQUFZLENBQUM7WUFDdEcsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVks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
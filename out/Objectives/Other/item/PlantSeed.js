define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "game/tile/Terrains", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../contextData/SetContextData", "../../core/MoveToTarget", "../../core/Restart", "../tile/DigTile", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Terrains_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, MoveToTarget_1, Restart_1, DigTile_1, UseItem_1) {
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
            const seed = (_a = this.seed) !== null && _a !== void 0 ? _a : this.getAcquiredItem(context);
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
            if (context.inventory.hoe) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(context.island, context.utilities.base.getBasePosition(context), (island, point, tile) => {
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
                        if (!(terrainDescription === null || terrainDescription === void 0 ? void 0 : terrainDescription.tillable)) {
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
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Till).setContextDataKey(IContext_1.ContextDataType.Item1));
                objectives.push(new Restart_1.default());
            }
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Plant, seed));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXNCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyxZQUFZLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sWUFBWSxHQUFHLE1BQUEsaUJBQWtCLENBQUMsTUFBQSxNQUFBLElBQUksQ0FBQyxXQUFXLEVBQUUsMENBQUUsS0FBSywwQ0FBRyxvQkFBVSxDQUFDLEtBQUssQ0FBRSxDQUFDLDBDQUFFLFlBQVksQ0FBQztZQUN0RyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNsQixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFF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
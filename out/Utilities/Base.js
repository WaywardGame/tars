define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "game/WorldZ", "utilities/game/TileHelpers", "utilities/math/Vector2", "../ITars", "./Tile"], function (require, exports, ITerrain_1, Terrains_1, WorldZ_1, TileHelpers_1, Vector2_1, ITars_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.baseUtilities = void 0;
    const nearBaseDistance = 14;
    const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);
    class BaseUtilities {
        reset() {
            this.tilesNearBaseCache = undefined;
        }
        isGoodBuildTile(context, point, tile, openAreaRadius) {
            if (!this.isOpenArea(context, point, tile, openAreaRadius)) {
                return false;
            }
            if (!this.hasBase(context)) {
                const tileType = TileHelpers_1.default.getType(tile);
                if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
                    return false;
                }
                return true;
            }
            return this.isNearBase(context, point);
        }
        isGoodWellBuildTile(context, point, tile, onlyUnlimited) {
            if (!this.isGoodBuildTile(context, point, tile)) {
                return false;
            }
            const x = point.x;
            const y = point.y;
            const caveTerrain = Terrains_1.default[TileHelpers_1.default.getType(game.getTile(x, y, WorldZ_1.WorldZ.Cave))];
            if (caveTerrain && (caveTerrain.water || caveTerrain.shallowWater)) {
                return true;
            }
            if (onlyUnlimited) {
                return false;
            }
            if (caveTerrain && !caveTerrain.passable) {
                return true;
            }
            for (let x2 = x - 6; x2 <= x + 6; x2++) {
                for (let y2 = y - 6; y2 <= y + 6; y2++) {
                    const validPoint = game.ensureValidPoint({ x: x2, y: y2, z: point.z });
                    if (validPoint) {
                        const tileDescription = Terrains_1.default[TileHelpers_1.default.getType(game.getTileFromPoint(validPoint))];
                        if (tileDescription && (tileDescription.water && !tileDescription.freshWater)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        isOpenArea(context, point, tile, radius = 1) {
            if (!Tile_1.tileUtilities.isOpenTile(context, point, tile, false) || Tile_1.tileUtilities.hasCorpses(tile)) {
                return false;
            }
            if (radius > 0) {
                for (let x = -radius; x <= radius; x++) {
                    for (let y = -radius; y <= radius; y++) {
                        const nearbyPoint = {
                            x: point.x + x,
                            y: point.y + y,
                            z: point.z,
                        };
                        if (!game.ensureValidPoint(nearbyPoint)) {
                            continue;
                        }
                        const nearbyTile = game.getTileFromPoint(nearbyPoint);
                        if (nearbyTile.doodad) {
                            return false;
                        }
                        const container = tile;
                        if (container.containedItems && container.containedItems.length > 0) {
                            return false;
                        }
                        if (!Tile_1.tileUtilities.isOpenTile(context, nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        getBaseDoodads(context) {
            let doodads = [];
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const baseDoodadOrDoodads = context.base[key];
                if (Array.isArray(baseDoodadOrDoodads)) {
                    doodads = doodads.concat(baseDoodadOrDoodads);
                }
                else {
                    doodads.push(baseDoodadOrDoodads);
                }
            }
            return doodads;
        }
        isBaseDoodad(context, doodad) {
            return this.getBaseDoodads(context).includes(doodad);
        }
        getBasePosition(context) {
            return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player.getPoint();
        }
        hasBase(context) {
            return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
        }
        isNearBase(context, point = context.player) {
            if (!this.hasBase(context)) {
                return false;
            }
            const baseDoodads = this.getBaseDoodads(context);
            for (const doodad of baseDoodads) {
                if (Vector2_1.default.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
                    return true;
                }
            }
            return false;
        }
        getTilesNearBase(context) {
            var _a;
            const basePosition = this.getBasePosition(context);
            (_a = this.tilesNearBaseCache) !== null && _a !== void 0 ? _a : (this.tilesNearBaseCache = TileHelpers_1.default.findMatchingTiles(basePosition, () => true, {
                canVisitTile: (point) => this.isNearBase(context, point),
            }));
            return this.tilesNearBaseCache;
        }
        getTilesWithItemsNearBase(context) {
            const result = {
                tiles: [],
                totalCount: 0,
            };
            for (const { point, tile } of this.getTilesNearBase(context)) {
                const containedItems = tile.containedItems;
                if (!containedItems || containedItems.length === 0) {
                    continue;
                }
                result.totalCount += containedItems.length;
                result.tiles.push(point);
            }
            return result;
        }
        getSwampTilesNearBase(context) {
            const result = [];
            for (const { point, tile } of this.getTilesNearBase(context)) {
                if (TileHelpers_1.default.getType(tile) === ITerrain_1.TerrainType.Swamp) {
                    result.push(point);
                }
            }
            return result;
        }
    }
    exports.baseUtilities = new BaseUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBYUEsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpELE1BQU0sYUFBYTtRQUlYLEtBQUs7WUFDWCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxlQUFlLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLGNBQXVCO1lBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFO2dCQUMzRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTNCLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7b0JBQzFFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXLEVBQUUsYUFBc0I7WUFDaEcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxLQUFLLENBQUM7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
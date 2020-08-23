define(["require", "exports", "game/WorldZ", "tile/ITerrain", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../ITars", "./Tile"], function (require, exports, WorldZ_1, ITerrain_1, Terrains_1, Vector2_1, TileHelpers_1, ITars_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTilesWithItemsNearBase = exports.isNearBase = exports.hasBase = exports.getBasePosition = exports.getBaseDoodads = exports.isOpenArea = exports.isGoodWellBuildTile = exports.isGoodBuildTile = void 0;
    const nearBaseDistance = 14;
    const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);
    function isGoodBuildTile(context, point, tile) {
        if (!isOpenArea(context, point, tile)) {
            return false;
        }
        if (!hasBase(context)) {
            const tileType = TileHelpers_1.default.getType(game.getTileFromPoint(point));
            if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.DesertSand || tileType === ITerrain_1.TerrainType.Gravel) {
                return false;
            }
            return true;
        }
        return isNearBase(context, point);
    }
    exports.isGoodBuildTile = isGoodBuildTile;
    function isGoodWellBuildTile(context, point, tile, onlyUnlimited) {
        if (!isGoodBuildTile(context, point, tile)) {
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
    exports.isGoodWellBuildTile = isGoodWellBuildTile;
    function isOpenArea(context, point, tile, radius = 1) {
        if (!Tile_1.isOpenTile(context, point, tile, false) || Tile_1.hasCorpses(tile)) {
            return false;
        }
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
                if (!Tile_1.isOpenTile(context, nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isOpenArea = isOpenArea;
    function getBaseDoodads(context) {
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
    exports.getBaseDoodads = getBaseDoodads;
    function getBasePosition(context) {
        return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player.getPoint();
    }
    exports.getBasePosition = getBasePosition;
    function hasBase(context) {
        return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
    }
    exports.hasBase = hasBase;
    function isNearBase(context, point = context.player) {
        if (!hasBase(context)) {
            return false;
        }
        const baseDoodads = getBaseDoodads(context);
        for (const doodad of baseDoodads) {
            if (Vector2_1.default.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
                return true;
            }
        }
        return false;
    }
    exports.isNearBase = isNearBase;
    function getTilesWithItemsNearBase(context) {
        const result = {
            tiles: [],
            totalCount: 0,
        };
        const tiles = TileHelpers_1.default.tilesInRange(context.player, nearBaseDistance, true);
        for (const [point, tile] of tiles) {
            const containedItems = tile.containedItems;
            if (!containedItems || containedItems.length === 0) {
                continue;
            }
            result.totalCount += containedItems.length;
            result.tiles.push(point);
        }
        return result;
    }
    exports.getTilesWithItemsNearBase = getTilesWithItemsNearBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpELFNBQWdCLGVBQWUsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXO1FBQzdFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN0QyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUV0QixNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxVQUFVLElBQUksUUFBUSxLQUFLLHNCQUFXLENBQUMsTUFBTSxFQUFFO2dCQUNqSCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBaEJELDBDQWdCQztJQUVELFNBQWdCLG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsS0FBZSxFQUFFLElBQVcsRUFBRSxhQUFzQjtRQUN6RyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDM0MsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxD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
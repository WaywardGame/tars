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
            const tileType = TileHelpers_1.default.getType(tile);
            if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpELFNBQWdCLGVBQWUsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXO1FBQzdFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN0QyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUV0QixNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQzFFLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFoQkQsMENBZ0JDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLGFBQXNCO1FBQ3pHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sV0FBVyxHQUFHLGtCQUFRLENB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
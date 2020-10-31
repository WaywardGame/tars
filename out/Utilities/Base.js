define(["require", "exports", "game/WorldZ", "tile/ITerrain", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../ITars", "./Tile"], function (require, exports, WorldZ_1, ITerrain_1, Terrains_1, Vector2_1, TileHelpers_1, ITars_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTilesWithItemsNearBase = exports.isNearBase = exports.hasBase = exports.getBasePosition = exports.getBaseDoodads = exports.isOpenArea = exports.isGoodWellBuildTile = exports.isGoodBuildTile = void 0;
    const nearBaseDistance = 14;
    const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);
    function isGoodBuildTile(context, point, tile, openAreaRadius) {
        if (!isOpenArea(context, point, tile, openAreaRadius)) {
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
                    if (!Tile_1.isOpenTile(context, nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
                        return false;
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpELFNBQWdCLGVBQWUsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXLEVBQUUsY0FBdUI7UUFDdEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRTtZQUN0RCxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUV0QixNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQzFFLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFoQkQsMENBZ0JDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLGFBQXNCO1FBQ3pHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWxCLE1B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
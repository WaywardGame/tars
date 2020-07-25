define(["require", "exports", "game/WorldZ", "tile/ITerrain", "tile/Terrains", "utilities/TileHelpers", "../ITars", "./Tile"], function (require, exports, WorldZ_1, ITerrain_1, Terrains_1, TileHelpers_1, ITars_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNearBase = exports.hasBase = exports.getBasePosition = exports.getBaseDoodads = exports.isOpenArea = exports.isGoodWellBuildTile = exports.isGoodBuildTile = void 0;
    const nearBaseDistance = 12;
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
        return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player;
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
        for (let x = nearBaseDistance * -1; x <= nearBaseDistance; x++) {
            for (let y = nearBaseDistance * -1; y <= nearBaseDistance; y++) {
                const nearbyPoint = {
                    x: point.x + x,
                    y: point.y + y,
                    z: point.z,
                };
                const nearbyTile = game.getTileFromPoint(nearbyPoint);
                const doodad = nearbyTile.doodad;
                if (doodad && isBaseDoodad(context, doodad)) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isNearBase = isNearBase;
    function isBaseDoodad(context, doodad) {
        const keys = Object.keys(ITars_1.baseInfo);
        for (const key of keys) {
            if (context.base[key].some(baseDoodad => baseDoodad === doodad)) {
                return true;
            }
        }
        return false;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBYUEsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFFNUIsU0FBZ0IsZUFBZSxDQUFDLE9BQWdCLEVBQUUsS0FBZSxFQUFFLElBQVc7UUFDN0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBRXRCLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksUUFBUSxLQUFLLHNCQUFXLENBQUMsU0FBUyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFVBQVUsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pILE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFoQkQsMENBZ0JDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLGFBQXNCO1FBQ3pHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sV0FBVyxHQUFHLGtCQUFRLENBQUMscUJBQVcsQ0FB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
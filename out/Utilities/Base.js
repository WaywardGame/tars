define(["require", "exports", "game/WorldZ", "tile/ITerrain", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../ITars", "./Tile"], function (require, exports, WorldZ_1, ITerrain_1, Terrains_1, Vector2_1, TileHelpers_1, ITars_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNearBase = exports.hasBase = exports.getBasePosition = exports.getBaseDoodads = exports.isOpenArea = exports.isGoodWellBuildTile = exports.isGoodBuildTile = void 0;
    const nearBaseDistanceSq = Math.pow(14, 2);
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
        const baseDoodads = getBaseDoodads(context);
        for (const doodad of baseDoodads) {
            if (Vector2_1.default.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
                return true;
            }
        }
        return false;
    }
    exports.isNearBase = isNearBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY0EsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUzQyxTQUFnQixlQUFlLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVztRQUM3RSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDdEMsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFFdEIsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxTQUFTLElBQUksUUFBUSxLQUFLLHNCQUFXLENBQUMsVUFBVSxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLE1BQU0sRUFBRTtnQkFDakgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQWhCRCwwQ0FnQkM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXLEVBQUUsYUFBc0I7UUFDekcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzNDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFbEIs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
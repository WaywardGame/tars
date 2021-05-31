define(["require", "exports", "game/tile/Terrains", "utilities/game/TileHelpers", "../Context", "../navigation/Navigation"], function (require, exports, Terrains_1, TileHelpers_1, Context_1, Navigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasItems = exports.hasCorpses = exports.canCarveCorpse = exports.canDig = exports.canGather = exports.isFreeOfOtherPlayers = exports.isOpenTile = exports.isOverWater = exports.getNearestTileLocation = exports.resetNearestTileLocationCache = void 0;
    const cache = new Map();
    function resetNearestTileLocationCache() {
        cache.clear();
    }
    exports.resetNearestTileLocationCache = resetNearestTileLocationCache;
    async function getNearestTileLocation(contextOrPosition, tileType) {
        const position = contextOrPosition instanceof Context_1.default ? contextOrPosition.player : contextOrPosition;
        const results = [];
        const z = position.z;
        const cacheId = `${tileType},${position.x},${position.y},${z}`;
        let result = cache.get(cacheId);
        if (!result) {
            result = await Navigation_1.default.get().getNearestTileLocation(tileType, { x: position.x, y: position.y, z: z });
            cache.set(cacheId, result);
        }
        results.push(result);
        return results.flat();
    }
    exports.getNearestTileLocation = getNearestTileLocation;
    function isOverWater(context) {
        const tile = game.getTileFromPoint(context.getPosition());
        const terrainType = TileHelpers_1.default.getType(tile);
        const terrainInfo = Terrains_1.default[terrainType];
        return terrainInfo && terrainInfo.water === true;
    }
    exports.isOverWater = isOverWater;
    function isOpenTile(context, point, tile, allowWater = true) {
        if (!game.isTileEmpty(tile)) {
            return false;
        }
        const terrainType = TileHelpers_1.default.getType(tile);
        const terrainInfo = Terrains_1.default[terrainType];
        if (terrainInfo) {
            if (!terrainInfo.passable && !terrainInfo.water) {
                return false;
            }
            if (!allowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
                return false;
            }
        }
        return isFreeOfOtherPlayers(context, point);
    }
    exports.isOpenTile = isOpenTile;
    function isFreeOfOtherPlayers(context, point) {
        const players = game.getPlayersAtPosition(point.x, point.y, point.z, false, true);
        if (players.length > 0) {
            for (const player of players) {
                if (player !== context.player) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isFreeOfOtherPlayers = isFreeOfOtherPlayers;
    function canGather(tile, skipDoodadCheck) {
        var _a;
        if (!skipDoodadCheck && !((_a = Terrains_1.default[TileHelpers_1.default.getType(tile)]) === null || _a === void 0 ? void 0 : _a.gather) && (tile.doodad || hasItems(tile))) {
            return false;
        }
        return !hasCorpses(tile) && !tile.creature && !tile.npc && !game.isPlayerAtTile(tile, false, true);
    }
    exports.canGather = canGather;
    function canDig(tile) {
        return !hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !hasItems(tile) && !game.isPlayerAtTile(tile, false, true);
    }
    exports.canDig = canDig;
    function canCarveCorpse(tile, skipCorpseCheck) {
        return (skipCorpseCheck || hasCorpses(tile))
            && !tile.creature && !tile.npc && !hasItems(tile) && !game.isPlayerAtTile(tile, false, true) && !tileEventManager.blocksTile(tile);
    }
    exports.canCarveCorpse = canCarveCorpse;
    function hasCorpses(tile) {
        return !!(tile.corpses && tile.corpses.length);
    }
    exports.hasCorpses = hasCorpses;
    function hasItems(tile) {
        const tileContainer = tile;
        return tileContainer.containedItems && tileContainer.containedItems.length > 0;
    }
    exports.hasItems = hasItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU0EsTUFBTSxLQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFdEQsU0FBZ0IsNkJBQTZCO1FBQzVDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCxzRUFFQztJQUVNLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxpQkFBcUMsRUFBRSxRQUFxQjtRQUV4RyxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsWUFBWSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBRXJHLE1BQU0sT0FBTyxHQUFzQixFQUFFLENBQUM7UUFHdEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVyQixNQUFNLE9BQU8sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFL0QsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6RyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFHckIsT0FBTyxPQUFPLENBQUMsSUFB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
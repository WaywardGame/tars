define(["require", "exports", "tile/Terrains", "utilities/TileHelpers", "../Context", "../Navigation/Navigation"], function (require, exports, Terrains_1, TileHelpers_1, Context_1, Navigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasItems = exports.hasCorpses = exports.canCarveCorpse = exports.canDig = exports.canGather = exports.isFreeOfOtherPlayers = exports.isOpenTile = exports.isSwimming = exports.getNearestTileLocation = exports.resetNearestTileLocationCache = void 0;
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
            results.push(result);
        }
        return results.flat();
    }
    exports.getNearestTileLocation = getNearestTileLocation;
    function isSwimming(context) {
        const tile = game.getTileFromPoint(context.getPosition());
        const terrainType = TileHelpers_1.default.getType(tile);
        const terrainInfo = Terrains_1.default[terrainType];
        return terrainInfo && terrainInfo.water === true && context.player.vehicleItemId === undefined;
    }
    exports.isSwimming = isSwimming;
    function isOpenTile(context, point, tile, allowWater = true) {
        if (tile.creature !== undefined) {
            return false;
        }
        if (tile.doodad !== undefined) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU0EsTUFBTSxLQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFdEQsU0FBZ0IsNkJBQTZCO1FBQzVDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCxzRUFFQztJQUVNLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxpQkFBcUMsRUFBRSxRQUFxQjtRQUV4RyxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsWUFBWSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBRXJHLE1BQU0sT0FBTyxHQUFzQixFQUFFLENBQUM7UUFHdEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVyQixNQUFNLE9BQU8sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFL0QsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6RyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JCO1FBR0QsT0FBTyxPQUFPLENBQUMsSUFB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
define(["require", "exports", "tile/Terrains", "utilities/TileHelpers", "../Navigation/Navigation"], function (require, exports, Terrains_1, TileHelpers_1, Navigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasItems = exports.hasCorpses = exports.canCarveCorpse = exports.canDig = exports.canGather = exports.isFreeOfOtherPlayers = exports.isOpenTile = exports.isSwimming = exports.getNearestTileLocation = exports.resetNearestTileLocationCache = void 0;
    const cache = new Map();
    function resetNearestTileLocationCache() {
        cache.clear();
    }
    exports.resetNearestTileLocationCache = resetNearestTileLocationCache;
    async function getNearestTileLocation(tileType, position) {
        const cacheId = `${tileType},${position.x},${position.y}${position.z}`;
        let result = cache.get(cacheId);
        if (!result) {
            result = await Navigation_1.default.get().getNearestTileLocation(tileType, position);
            cache.set(cacheId, result);
        }
        return result;
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
        return !hasCorpses(tile) && !tile.creature && !tile.npc && !hasItems(tile) && !game.isPlayerAtTile(tile, false, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU0EsTUFBTSxLQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFdEQsU0FBZ0IsNkJBQTZCO1FBQzVDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCxzRUFFQztJQUVNLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxRQUFxQixFQUFFLFFBQWtCO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFdkUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFWRCx3REFVQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUFnQjtRQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxPQUFPLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMs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
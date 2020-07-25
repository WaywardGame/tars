define(["require", "exports", "tile/Terrains", "utilities/TileHelpers", "../Navigation/Navigation"], function (require, exports, Terrains_1, TileHelpers_1, Navigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasCorpses = exports.canGather = exports.isFreeOfOtherPlayers = exports.isOpenTile = exports.isSwimming = exports.getNearestTileLocation = exports.resetNearestTileLocationCache = void 0;
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
    function canGather(tile) {
        const terrainDescription = Terrains_1.default[TileHelpers_1.default.getType(tile)];
        if (!terrainDescription.gather && (tile.doodad || tile.containedItems)) {
            return false;
        }
        if (tile.creature !== undefined || tile.npc !== undefined || hasCorpses(tile) || game.isPlayerAtTile(tile, false, true)) {
            return false;
        }
        return true;
    }
    exports.canGather = canGather;
    function hasCorpses(tile) {
        return !!(tile.corpses && tile.corpses.length);
    }
    exports.hasCorpses = hasCorpses;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBVUEsTUFBTSxLQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFdEQsU0FBZ0IsNkJBQTZCO1FBQzVDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCxzRUFFQztJQUVNLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxRQUFxQixFQUFFLFFBQWtCO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFdkUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFWRCx3REFVQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUFnQjtRQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxPQUFPLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMs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
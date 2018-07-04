var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "tile/Terrains", "utilities/TileHelpers", "../Navigation"], function (require, exports, Terrains_1, TileHelpers_1, Navigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getNearestTileLocation(tileType, position) {
        return __awaiter(this, void 0, void 0, function* () {
            return Navigation_1.getNavigation().getNearestTileLocation(tileType, position);
        });
    }
    exports.getNearestTileLocation = getNearestTileLocation;
    function isOpenTile(point, tile, ignoreLocalPlayer = true, allowWater = true) {
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
        const players = game.getPlayersAtPosition(point.x, point.y, point.z, false, true);
        if (players.length > 0) {
            for (const player of players) {
                if (player !== localPlayer || (!ignoreLocalPlayer && player === localPlayer)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isOpenTile = isOpenTile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLGdDQUE2QyxRQUFxQixFQUFFLFFBQWtCOztZQUNyRixPQUFPLDBCQUFhLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUFBO0lBRkQsd0RBRUM7SUFFRCxvQkFBMkIsS0FBZSxFQUFFLElBQVcsRUFBRSxvQkFBNkIsSUFBSSxFQUFFLGFBQXNCLElBQUk7UUFDckgsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUNoQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUM5QixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLFdBQVcsRUFBRTtZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ25FLE9BQU8sS0FBSyxDQUFDO2FBQ2I7U0FDRDtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEYsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN2QixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsSUFBSSxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLEtBQUssV0FBVyxDQUFDLEVBQUU7b0JBQzdFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQS9CRCxnQ0ErQkMifQ==
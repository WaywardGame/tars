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
    function canGather(point) {
        const tile = game.getTileFromPoint(point);
        const terrainDescription = Terrains_1.default[TileHelpers_1.default.getType(tile)];
        if (!terrainDescription.gather && (tile.doodad || tile.containedItems)) {
            return false;
        }
        if (tile.creature !== undefined || tile.npc !== undefined || game.isPlayerAtTile(tile, false, true)) {
            return false;
        }
        return true;
    }
    exports.canGather = canGather;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVNBLFNBQXNCLHNCQUFzQixDQUFDLFFBQXFCLEVBQUUsUUFBa0I7O1lBQ3JGLE9BQU8sMEJBQWEsRUFBRSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFGRCx3REFFQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLG9CQUE2QixJQUFJLEVBQUUsYUFBc0IsSUFBSTtRQUNySCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQ2hDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxNQUFNLFdBQVcsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxNQUFNLFdBQVcsR0FBRyxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFDLElBQUksV0FBVyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDaEQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDbkUsT0FBTyxLQUFLLENBQUM7YUFDYjtTQUNEO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRixJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUM3QixJQUFJLE1BQU0sS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLGlCQUFpQixJQUFJLE1BQU0sS0FBSyxXQUFXLENBQUMsRUFBRTtvQkFDN0UsT0FBTyxLQUFLLENBQUM7aUJBQ2I7YUFDRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBL0JELGdDQStCQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxLQUFlO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSyxJQUFtQixDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNwRyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBYkQsOEJBYUMifQ==
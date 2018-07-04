define(["require", "exports", "./Tile"], function (require, exports, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nearBaseDistance = 10;
    function isGoodBuildTile(base, point, tile) {
        return isOpenArea(point, tile) && isNearBase(base, point);
    }
    exports.isGoodBuildTile = isGoodBuildTile;
    function isOpenArea(point, tile) {
        if (!Tile_1.isOpenTile(point, tile, false, false) || tile.corpses !== undefined) {
            return false;
        }
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const nearbyPoint = {
                    x: point.x + x,
                    y: point.y + y,
                    z: point.z
                };
                const nearbyTile = game.getTileFromPoint(nearbyPoint);
                if (nearbyTile.doodad) {
                    return false;
                }
                const container = tile;
                if (container.containedItems && container.containedItems.length > 0) {
                    return false;
                }
                if (!Tile_1.isOpenTile(nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.isOpenArea = isOpenArea;
    function getBaseDoodads(base) {
        let doodads = [];
        for (const key of Object.keys(base)) {
            const baseDoodadOrDoodads = base[key];
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
    function isBaseDoodad(base, doodad) {
        return Object.keys(base).findIndex(key => {
            const baseDoodadOrDoodads = base[key];
            if (Array.isArray(baseDoodadOrDoodads)) {
                return baseDoodadOrDoodads.indexOf(doodad) !== -1;
            }
            return baseDoodadOrDoodads === doodad;
        }) !== -1;
    }
    exports.isBaseDoodad = isBaseDoodad;
    function getBasePosition(base) {
        return base.campfire || base.waterStill || base.kiln || localPlayer;
    }
    exports.getBasePosition = getBasePosition;
    function hasBase(base) {
        return Object.keys(base).findIndex(key => {
            const baseDoodadOrDoodads = base[key];
            if (Array.isArray(baseDoodadOrDoodads)) {
                return baseDoodadOrDoodads.length > 0;
            }
            return baseDoodadOrDoodads !== undefined;
        }) !== -1;
    }
    exports.hasBase = hasBase;
    function isNearBase(base, point) {
        if (!hasBase(base)) {
            return true;
        }
        for (let x = -nearBaseDistance; x <= nearBaseDistance; x++) {
            for (let y = -nearBaseDistance; y <= nearBaseDistance; y++) {
                const nearbyPoint = {
                    x: point.x + x,
                    y: point.y + y,
                    z: point.z
                };
                const nearbyTile = game.getTileFromPoint(nearbyPoint);
                const doodad = nearbyTile.doodad;
                if (doodad && isBaseDoodad(base, doodad)) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isNearBase = isNearBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUU1Qix5QkFBZ0MsSUFBVyxFQUFFLEtBQWUsRUFBRSxJQUFXO1FBQ3hFLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFGRCwwQ0FFQztJQUVELG9CQUEyQixLQUFlLEVBQUUsSUFBVztRQUN0RCxJQUFJLENBQUMsaUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN6RSxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0IsTUFBTSxXQUFXLEdBQWE7b0JBQzdCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ2QsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDZCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ1YsQ0FBQztnQkFFRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RELElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDdEIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBa0IsQ0FBQztnQkFDckMsSUFB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
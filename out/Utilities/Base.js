define(["require", "exports", "Enums", "./Tile", "./Object", "utilities/TileHelpers"], function (require, exports, Enums_1, Tile_1, Object_1, TileHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nearBaseDistance = 10;
    function findBuildTile(hashCode, base, targetOrigin) {
        const isValidOrigin = (origin) => {
            let dirt = 0;
            let grass = 0;
            for (let x = -6; x <= 6; x++) {
                for (let y = -6; y <= 6; y++) {
                    if (x === 0 && y === 0) {
                        continue;
                    }
                    const point = {
                        x: origin.x + x,
                        y: origin.y + y,
                        z: origin.z
                    };
                    const tile = game.getTileFromPoint(point);
                    if (!tile.doodad && isGoodBuildTile(base, point, tile)) {
                        const tileType = TileHelpers_1.default.getType(tile);
                        if (tileType === Enums_1.TerrainType.Dirt) {
                            dirt++;
                        }
                        else if (tileType === Enums_1.TerrainType.Grass) {
                            grass++;
                        }
                    }
                }
            }
            return dirt >= 3 && grass >= 4;
        };
        if (targetOrigin === undefined) {
            targetOrigin = Object_1.findDoodad(hashCode, doodad => {
                const description = doodad.description();
                if (!description || !description.isTree) {
                    return false;
                }
                return isValidOrigin(doodad);
            });
        }
        else if (!isValidOrigin(targetOrigin)) {
            return undefined;
        }
        if (targetOrigin === undefined) {
            return undefined;
        }
        let target;
        for (let x = -6; x <= 6; x++) {
            for (let y = -6; y <= 6; y++) {
                if (x === 0 && y === 0) {
                    continue;
                }
                const point = {
                    x: targetOrigin.x + x,
                    y: targetOrigin.y + y,
                    z: targetOrigin.z
                };
                const tile = game.getTileFromPoint(point);
                if (isGoodBuildTile(base, point, tile)) {
                    target = point;
                    x = 7;
                    break;
                }
            }
        }
        return target;
    }
    exports.findBuildTile = findBuildTile;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUU1QixTQUFnQixhQUFhLENBQUMsUUFBZ0IsRUFBRSxJQUFXLEVBQUUsWUFBdUI7UUFDbkYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxNQUFnQixFQUFFLEVBQUU7WUFFMUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBRWQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN2QixTQUFTO3FCQUNUO29CQUVELE1BQU0sS0FBSyxHQUFhO3dCQUN2QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO3dCQUNmLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQ2YsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUNYLENBQUM7b0JBRUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDdkQsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzNDLElBQUksUUFBUSxLQUFLLG1CQUFXLENBQUMsSUFB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
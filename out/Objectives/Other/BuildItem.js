define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "tile/ITerrain", "utilities/math/Vector2", "utilities/TileHelpers", "../../Context", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Base", "../../Utilities/Movement", "../../Utilities/Object", "../../Utilities/Tile", "../Analyze/AnalyzeBase", "../Core/Lambda", "../Core/MoveToTarget", "./UseItem"], function (require, exports, IDoodad_1, IAction_1, ITerrain_1, Vector2_1, TileHelpers_1, Context_1, IObjective_1, ITars_1, Objective_1, Base, movementUtilities, Object_1, Tile_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const recalculateMovements = 40;
    const nearRocksDistance = Math.pow(24, 2);
    class BuildItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
            this.movements = 0;
        }
        getIdentifier() {
            return `BuildItem:${this.item}`;
        }
        async execute(context) {
            const item = this.item || context.getData(Context_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                this.log.error("Invalid build item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || description.use.indexOf(IAction_1.ActionType.Build) === -1) {
                this.log.error("Invalid build item", item);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (!description.onUse || !description.onUse[IAction_1.ActionType.Build] === undefined) {
                this.log.error("Invalid build item", item);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const buildDoodadType = description.onUse[IAction_1.ActionType.Build];
            const baseInfo = this.getBaseInfo(buildDoodadType);
            const isWell = doodadManager.isInGroup(buildDoodadType, IDoodad_1.DoodadTypeGroup.Well);
            if (isWell) {
                this.log.info("Going build a well");
            }
            if (Base.hasBase(context)) {
                if (baseInfo && baseInfo.placeNear !== undefined) {
                    const nearDoodads = context.base[baseInfo.placeNear];
                    const possiblePoints = AnalyzeBase_1.default.getNearPoints(nearDoodads);
                    for (const point of possiblePoints) {
                        if (Base.isOpenArea(context, point, game.getTileFromPoint(point), 0)) {
                            this.target = point;
                            break;
                        }
                    }
                }
                else {
                    const baseDoodads = Base.getBaseDoodads(context);
                    for (const baseDoodad of baseDoodads) {
                        if (isWell) {
                            this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodWellBuildTile(context, point, tile, true), ITars_1.defaultMaxTilesChecked);
                            if (this.target === undefined) {
                                this.log.info("Couldn't find unlimited well tile");
                                this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodWellBuildTile(context, point, tile, false), ITars_1.defaultMaxTilesChecked);
                            }
                        }
                        else {
                            this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodBuildTile(context, point, tile), ITars_1.defaultMaxTilesChecked);
                        }
                        if (this.target !== undefined) {
                            break;
                        }
                    }
                }
            }
            else if (!isWell) {
                this.log.info("Looking for build tile...");
                this.target = await this.findInitialBuildTile(context);
            }
            if (this.target === undefined) {
                this.log.info("Unable to find location for build item");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(this.target, true),
                new UseItem_1.default(IAction_1.ActionType.Build, item),
                new Lambda_1.default(async (context) => {
                    const tile = context.player.getFacingTile();
                    if (tile.doodad) {
                        context.setData(Context_1.ContextDataType.LastBuiltDoodad, tile.doodad);
                    }
                    return IObjective_1.ObjectiveResult.Complete;
                }),
            ];
        }
        async onMove(context) {
            this.movements++;
            if (this.movements >= recalculateMovements) {
                this.movements = 0;
                this.target = undefined;
                movementUtilities.resetMovementOverlays();
                context.player.walkAlongPath(undefined);
            }
            return super.onMove(context);
        }
        getBaseInfo(buildDoodadType) {
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const info = ITars_1.baseInfo[key];
                if (AnalyzeBase_1.default.matchesBaseInfo(info, buildDoodadType)) {
                    return info;
                }
            }
            return undefined;
        }
        async findInitialBuildTile(context) {
            const facingPoint = context.player.getFacingPoint();
            const facingTile = context.player.getFacingTile();
            if (await this.isGoodTargetOrigin(context, facingPoint) && Base.isGoodBuildTile(context, facingPoint, facingTile)) {
                return facingPoint;
            }
            const sortedObjects = Object_1.getSortedObjects(context, Object_1.FindObjectType.Doodad, island.doodads);
            for (const doodad of sortedObjects) {
                if (doodad !== undefined && doodad.z === context.player.z) {
                    const description = doodad.description();
                    if (description && description.isTree && await this.isGoodTargetOrigin(context, doodad)) {
                        for (let x = -6; x <= 6; x++) {
                            for (let y = -6; y <= 6; y++) {
                                if (x === 0 && y === 0) {
                                    continue;
                                }
                                const point = {
                                    x: doodad.x + x,
                                    y: doodad.y + y,
                                    z: doodad.z,
                                };
                                const tile = game.getTileFromPoint(point);
                                if (Base.isGoodBuildTile(context, point, tile)) {
                                    return point;
                                }
                            }
                        }
                    }
                }
            }
        }
        async isGoodTargetOrigin(context, origin) {
            let tree = 0;
            let grass = 0;
            for (let x = -6; x <= 6; x++) {
                for (let y = -6; y <= 6; y++) {
                    if (x === 0 && y === 0) {
                        continue;
                    }
                    const point = {
                        x: origin.x + x,
                        y: origin.y + y,
                        z: origin.z,
                    };
                    const tile = game.getTileFromPoint(point);
                    if (tile.doodad) {
                        const description = tile.doodad.description();
                        if (description && description.isTree) {
                            tree++;
                        }
                    }
                    else if (Base.isGoodBuildTile(context, point, tile)) {
                        const tileType = TileHelpers_1.default.getType(tile);
                        if (tileType === ITerrain_1.TerrainType.Grass) {
                            grass++;
                        }
                    }
                }
            }
            if (grass >= 20 && tree >= 6) {
                const rockTileLocations = await Tile_1.getNearestTileLocation(ITerrain_1.TerrainType.Rocks, origin);
                const sandstoneTileLocations = await Tile_1.getNearestTileLocation(ITerrain_1.TerrainType.Sandstone, origin);
                if (rockTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(tileLocation.point, origin) <= nearRocksDistance) ||
                    sandstoneTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(tileLocation.point, origin) <= nearRocksDistance)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvQnVpbGRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQXVCQSxNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztJQUVoQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUsvQyxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFGaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUl0QixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pGLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMz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
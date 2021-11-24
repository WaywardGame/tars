define(["require", "exports", "game/biome/IBiome", "game/doodad/DoodadManager", "game/doodad/IDoodad", "game/entity/action/IAction", "game/tile/ITerrain", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../../IContext", "../../../IObjective", "../../../ITars", "../../../Objective", "../../../utilities/Base", "../../../utilities/Movement", "../../../utilities/Object", "../../../utilities/Tile", "../../analyze/AnalyzeBase", "../../core/Lambda", "../../core/MoveToTarget", "../tile/PickUpAllTileItems", "./UseItem"], function (require, exports, IBiome_1, DoodadManager_1, IDoodad_1, IAction_1, ITerrain_1, TileHelpers_1, Vector2_1, IContext_1, IObjective_1, ITars_1, Objective_1, Base_1, Movement_1, Object_1, Tile_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, PickUpAllTileItems_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const recalculateMovements = 40;
    const nearRocksDistance = Math.pow(24, 2);
    const nearWaterDistance = Math.pow(24, 2);
    class BuildItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
            this.movements = 0;
        }
        getIdentifier() {
            return `BuildItem:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Building ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a;
            const item = (_a = this.item) !== null && _a !== void 0 ? _a : context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                this.log.error("Invalid build item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || !description.use.includes(IAction_1.ActionType.Build)) {
                this.log.error(`Invalid build item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (!description.onUse || !description.onUse[IAction_1.ActionType.Build] === undefined) {
                this.log.error(`Invalid build item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const buildDoodadType = description.onUse[IAction_1.ActionType.Build];
            const baseInfo = this.getBaseInfo(buildDoodadType);
            const isWell = DoodadManager_1.default.isInGroup(buildDoodadType, IDoodad_1.DoodadTypeGroup.Well);
            if (isWell) {
                this.log.info("Going build a well");
            }
            if (Base_1.baseUtilities.hasBase(context)) {
                if (baseInfo && baseInfo.tryPlaceNear !== undefined) {
                    const nearDoodads = context.base[baseInfo.tryPlaceNear];
                    const possiblePoints = AnalyzeBase_1.default.getNearPoints(nearDoodads);
                    for (const point of possiblePoints) {
                        if (Base_1.baseUtilities.isOpenArea(context, point, context.island.getTileFromPoint(point), 0)) {
                            this.target = point;
                            break;
                        }
                    }
                }
                if (!this.target) {
                    const baseDoodads = Base_1.baseUtilities.getBaseDoodads(context);
                    for (const baseDoodad of baseDoodads) {
                        if (isWell) {
                            this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => Base_1.baseUtilities.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                            if (this.target === undefined) {
                                this.log.info("Couldn't find unlimited well tile");
                                this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => Base_1.baseUtilities.isGoodWellBuildTile(context, point, tile, false), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                            }
                        }
                        else {
                            this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => Base_1.baseUtilities.isGoodBuildTile(context, point, tile, baseInfo === null || baseInfo === void 0 ? void 0 : baseInfo.openAreaRadius), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
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
                new PickUpAllTileItems_1.default(this.target),
                new UseItem_1.default(IAction_1.ActionType.Build, item),
                new Lambda_1.default(async (context) => {
                    const tile = context.player.getFacingTile();
                    if (tile.doodad) {
                        context.setData(IContext_1.ContextDataType.LastBuiltDoodad, tile.doodad);
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
                Movement_1.movementUtilities.resetMovementOverlays();
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
            if (await this.isGoodTargetOrigin(context, facingPoint) && Base_1.baseUtilities.isGoodBuildTile(context, facingPoint, facingTile)) {
                return facingPoint;
            }
            const sortedObjects = Object_1.objectUtilities.getSortedObjects(context, Object_1.FindObjectType.Doodad, context.island.doodads.getObjects());
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
                                const tile = context.island.getTileFromPoint(point);
                                if (Base_1.baseUtilities.isGoodBuildTile(context, point, tile)) {
                                    return point;
                                }
                            }
                        }
                    }
                }
            }
        }
        async isGoodTargetOrigin(context, origin) {
            let nearbyTrees = 0;
            let nearbyCommonTiles = 0;
            let commonTerrainType;
            let rockType;
            let waterType;
            let treeRequirementCount = 6;
            switch (context.island.biomeType) {
                case IBiome_1.BiomeType.Coastal:
                    commonTerrainType = ITerrain_1.TerrainType.Grass;
                    rockType = ITerrain_1.TerrainType.Rocks;
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    break;
                case IBiome_1.BiomeType.IceCap:
                    commonTerrainType = ITerrain_1.TerrainType.Snow;
                    rockType = ITerrain_1.TerrainType.RocksWithSnow;
                    waterType = ITerrain_1.TerrainType.FreezingSeawater;
                    break;
                case IBiome_1.BiomeType.Arid:
                    commonTerrainType = ITerrain_1.TerrainType.DesertSand;
                    rockType = ITerrain_1.TerrainType.Sandstone;
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    treeRequirementCount = 3;
                    break;
                default:
                    commonTerrainType = ITerrain_1.TerrainType.Dirt;
                    rockType = ITerrain_1.TerrainType.Rocks;
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    break;
            }
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
                    const tile = context.island.getTileFromPoint(point);
                    if (tile.doodad) {
                        const description = tile.doodad.description();
                        if (description && description.isTree) {
                            nearbyTrees++;
                        }
                    }
                    else if (Base_1.baseUtilities.isGoodBuildTile(context, point, tile)) {
                        if (TileHelpers_1.default.getType(tile) === commonTerrainType) {
                            nearbyCommonTiles++;
                        }
                    }
                }
            }
            if (nearbyCommonTiles < 20 || nearbyTrees < treeRequirementCount) {
                return false;
            }
            const rockTileLocations = await Tile_1.tileUtilities.getNearestTileLocation(origin, rockType);
            if (rockTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.point) > nearRocksDistance)) {
                return false;
            }
            const shallowSeawaterTileLocations = await Tile_1.tileUtilities.getNearestTileLocation(origin, waterType);
            if (shallowSeawaterTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.point) > nearWaterDistance)) {
                return false;
            }
            return true;
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFMUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFLL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1lBRmhDLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJdEIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLFlBQVksTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxNQUFNLElBQUksR0FBRyxNQUFBLElBQUksQ0FBQyxJQUFJLG1DQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDckMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxJQUFJ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
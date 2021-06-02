define(["require", "exports", "game/biome/IBiome", "game/doodad/IDoodad", "game/entity/action/IAction", "game/tile/ITerrain", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../../IContext", "../../../IObjective", "../../../ITars", "../../../Objective", "../../../utilities/Base", "../../../utilities/Movement", "../../../utilities/Object", "../../../utilities/Tile", "../../analyze/AnalyzeBase", "../../core/Lambda", "../../core/MoveToTarget", "./UseItem"], function (require, exports, IBiome_1, IDoodad_1, IAction_1, ITerrain_1, TileHelpers_1, Vector2_1, IContext_1, IObjective_1, ITars_1, Objective_1, Base_1, Movement_1, Object_1, Tile_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, UseItem_1) {
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
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                this.log.error("Invalid build item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || !description.use.includes(IAction_1.ActionType.Build)) {
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
            if (Base_1.baseUtilities.hasBase(context)) {
                if (baseInfo && baseInfo.tryPlaceNear !== undefined) {
                    const nearDoodads = context.base[baseInfo.tryPlaceNear];
                    const possiblePoints = AnalyzeBase_1.default.getNearPoints(nearDoodads);
                    for (const point of possiblePoints) {
                        if (Base_1.baseUtilities.isOpenArea(context, point, game.getTileFromPoint(point), 0)) {
                            this.target = point;
                            break;
                        }
                    }
                }
                if (!this.target) {
                    const baseDoodads = Base_1.baseUtilities.getBaseDoodads(context);
                    for (const baseDoodad of baseDoodads) {
                        if (isWell) {
                            this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base_1.baseUtilities.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                            if (this.target === undefined) {
                                this.log.info("Couldn't find unlimited well tile");
                                this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base_1.baseUtilities.isGoodWellBuildTile(context, point, tile, false), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                            }
                        }
                        else {
                            this.target = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base_1.baseUtilities.isGoodBuildTile(context, point, tile, baseInfo === null || baseInfo === void 0 ? void 0 : baseInfo.openAreaRadius), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
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
            const sortedObjects = Object_1.objectUtilities.getSortedObjects(context, Object_1.FindObjectType.Doodad, island.doodads);
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
            switch (island.biomeType) {
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
                    const tile = game.getTileFromPoint(point);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFMUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFLL0MsWUFBNkIsSUFBVztZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFPO1lBRmhDLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJdEIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLFlBQVksTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDcEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQzdFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBZSxDQUFDO1lBRTFFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFbkQsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUseUJBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RSxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbkMsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7b0JBQ3BELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN4RCxNQUFNLGNBQWMsR0FBRyxxQkFBVyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFOUQsS0FBSyxNQUFNLEtBQUssSUFBSSxjQUFjLEVBQUU7d0JBQ25DLElBQUksb0JBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7NEJBQzlFLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDOzRCQUNwQixNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNqQixNQUFNLFdBQVcsR0FBRyxvQkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFMUQsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7d0JBQ3JDLElBQUksTUFBTSxFQUFFOzRCQUVYLElBQUksQ0FBQyxNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxvQkFBYSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQzs0QkFDcEwsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQ0FDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztnQ0FDbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsOEJBQXNCLEVBQUUsQ0FBQyxDQUFDOzZCQUNyTDt5QkFFRDs2QkFBTTs0QkFDTixJQUFJLENBQUMsTUFBTSxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsb0JBQWEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGNBQWMsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQzt5QkFDcE07d0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDOUIsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDthQUVEO2lCQUFNLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBRTNDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdkQ7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7b0JBQzFCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQzlEO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO1FBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFnQjtZQUNuQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLG9CQUFvQixFQUFFO2dCQUkzQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7Z0JBRXhCLDRCQUFpQixDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTyxXQUFXLENBQUMsZUFBMkI7WUFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBUSxDQUFrQixDQUFDO1lBQ3BELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLElBQUksR0FBRyxnQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLHFCQUFXLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsRUFBRTtvQkFDdkQsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBZ0I7WUFDbEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRWxELElBQUksTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxJQUFJLG9CQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQzNILE9BQU8sV0FBVyxDQUFDO2FBQ25CO1lBRUQsTUFBTSxhQUFhLEdBQUcsd0JBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsdUJBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQW1CLENBQUMsQ0FBQztZQUVuSCxLQUFLLE1BQU0sTUFBTSxJQUFJLGFBQWEsRUFBRTtnQkFDbkMsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7b0JBQzFELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7d0JBQ3hGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtvQ0FDdkIsU0FBUztpQ0FDVDtnQ0FFRCxNQUFNLEtBQUssR0FBYTtvQ0FDdkIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQ0FDZixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO29DQUNmLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztpQ0FDWCxDQUFDO2dDQUVGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQ0FFMUMsSUFBSSxvQkFBYSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO29DQUN4RCxPQUFPLEtBQUssQ0FBQztpQ0FDYjs2QkFDRDt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFnQixFQUFFLE1BQWdCO1lBRWxFLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUNwQixJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUcxQixJQUFJLGlCQUE4QixDQUFDO1lBQ25DLElBQUksUUFBcUIsQ0FBQztZQUMxQixJQUFJLFNBQXNCLENBQUM7WUFDM0IsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7WUFFN0IsUUFBUSxNQUFNLENBQUMsU0FBUyxFQUFFO2dCQUN6QixLQUFLLGtCQUFTLENBQUMsT0FBTztvQkFDckIsaUJBQWlCLEdBQUcsc0JBQVcsQ0FBQyxLQUFLLENBQUM7b0JBQ3RDLFFBQVEsR0FBRyxzQkFBVyxDQUFDLEtBQUssQ0FBQztvQkFDN0IsU0FBUyxHQUFHLHNCQUFXLENBQUMsZUFBZSxDQUFDO29CQUN4QyxNQUFNO2dCQUVQLEtBQUssa0JBQVMsQ0FBQyxNQUFNO29CQUNwQixpQkFBaUIsR0FBRyxzQkFBVyxDQUFDLElBQUksQ0FBQztvQkFDckMsUUFBUSxHQUFHLHNCQUFXLENBQUMsYUFBYSxDQUFDO29CQUNyQyxTQUFTLEdBQUcsc0JBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDekMsTUFBTTtnQkFFUCxLQUFLLGtCQUFTLENBQUMsSUFBSTtvQkFDbEIsaUJBQWlCLEdBQUcsc0JBQVcsQ0FBQyxVQUFVLENBQUM7b0JBQzNDLFFBQVEsR0FBRyxzQkFBVyxDQUFDLFNBQVMsQ0FBQztvQkFDakMsU0FBUyxHQUFHLHNCQUFXLENBQUMsZUFBZSxDQUFDO29CQUN4QyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLE1BQU07Z0JBRVA7b0JBQ0MsaUJBQWlCLEdBQUcsc0JBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3JDLFFBQVEsR0FBRyxzQkFBVyxDQUFDLEtBQUssQ0FBQztvQkFDN0IsU0FBUyxHQUFHLHNCQUFXLENBQUMsZUFBZSxDQUFDO29CQUN4QyxNQUFNO2FBQ1A7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ3ZCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxLQUFLLEdBQWE7d0JBQ3ZCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQ2YsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFDZixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7cUJBQ1gsQ0FBQztvQkFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDaEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDOUMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTs0QkFDdEMsV0FBVyxFQUFFLENBQUM7eUJBQ2Q7cUJBRUQ7eUJBQU0sSUFBSSxvQkFBYSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUMvRCxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLGlCQUFpQixFQUFFOzRCQUNwRCxpQkFBaUIsRUFBRSxDQUFDO3lCQUNwQjtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLElBQUksV0FBVyxHQUFHLG9CQUFvQixFQUFFO2dCQUNqRSxPQUFPLEtBQUssQ0FBQzthQUNiO1lBR0QsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLG9CQUFhLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNySCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBR0QsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLG9CQUFhLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25HLElBQUksNEJBQTRCLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNoSSxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBRUQ7SUEvUEQsNEJBK1BDIn0=
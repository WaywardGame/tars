define(["require", "exports", "game/entity/player/IPlayer", "game/island/IIsland", "game/tile/ITerrain", "game/tile/Terrains", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, IPlayer_1, IIsland_1, ITerrain_1, Terrains_1, TileHelpers_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveToWaterType = void 0;
    var MoveToWaterType;
    (function (MoveToWaterType) {
        MoveToWaterType[MoveToWaterType["AnyWater"] = 0] = "AnyWater";
        MoveToWaterType[MoveToWaterType["SailAwayWater"] = 1] = "SailAwayWater";
        MoveToWaterType[MoveToWaterType["FishableWater"] = 2] = "FishableWater";
    })(MoveToWaterType = exports.MoveToWaterType || (exports.MoveToWaterType = {}));
    class MoveToWater extends Objective_1.default {
        constructor(waterType, options) {
            super();
            this.waterType = waterType;
            this.options = options;
        }
        getIdentifier() {
            return `MoveToWater:${this.waterType}:${this.options?.disallowBoats}:${this.options?.moveToAdjacentTile}`;
        }
        getStatus() {
            return this.waterType === MoveToWaterType.AnyWater ? "Moving to water" : "Moving to the ocean";
        }
        async execute(context) {
            if (context.human.vehicleItemReference) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (this.waterType === MoveToWaterType.AnyWater && context.utilities.tile.isSwimmingOrOverWater(context)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const navigation = context.utilities.navigation;
            const disabledTiles = new Set();
            const target = TileHelpers_1.default.findMatchingTile(context.island, context.getPosition(), (_, point, tile) => {
                if (disabledTiles.has(tile)) {
                    return false;
                }
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (!terrainDescription) {
                    return false;
                }
                switch (this.waterType) {
                    case MoveToWaterType.AnyWater:
                        if (!terrainDescription.water) {
                            return false;
                        }
                        break;
                    case MoveToWaterType.SailAwayWater:
                        if (tileType !== ITerrain_1.TerrainType.DeepSeawater) {
                            return false;
                        }
                        const result = context.human.canSailAwayFromPosition(context.human.island, point);
                        if (!result.canSailAway) {
                            if (result.blockedTilesChecked) {
                                disabledTiles.addFrom(result.blockedTilesChecked);
                            }
                            return false;
                        }
                        break;
                    case MoveToWaterType.FishableWater:
                        if (!terrainDescription.water || terrainDescription.shallowWater) {
                            return false;
                        }
                        const tileData = context.island.getTileData(point.x, point.y, point.z);
                        if (tileData && !tileData[0].fishAvailable) {
                            return false;
                        }
                        const standableNearbyPoints = [];
                        for (const nearbyPoint of TileHelpers_1.default.getPointsAround(context.island, point)) {
                            const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
                            const nearbyTileType = TileHelpers_1.default.getType(nearbyTile);
                            const nearbyTerrainDescription = Terrains_1.default[nearbyTileType];
                            if ((nearbyTerrainDescription?.shallowWater || !nearbyTerrainDescription?.water) && !navigation.isDisabledFromPoint(nearbyPoint)) {
                                standableNearbyPoints.push(nearbyPoint);
                            }
                        }
                        if (standableNearbyPoints.length === 0) {
                            return false;
                        }
                        const targetPoints = [];
                        for (const standableNearbyPoint of standableNearbyPoints) {
                            const direction = Vector2_1.default.DIRECTIONS[(0, IPlayer_1.getDirectionFromMovement)(point.x - standableNearbyPoint.x, point.y - standableNearbyPoint.y)];
                            const targetX = standableNearbyPoint.x + (direction.x * (this.options?.fishingRange ?? 1));
                            const targetY = standableNearbyPoint.y + (direction.y * (this.options?.fishingRange ?? 1));
                            const targetTile = context.island.getTile(targetX, targetY, point.z);
                            const targetTileType = TileHelpers_1.default.getType(targetTile);
                            const targetTerrainDescription = Terrains_1.default[targetTileType];
                            if (targetTerrainDescription?.shallowWater || !targetTerrainDescription?.water) {
                                return false;
                            }
                            const targetTileData = context.island.getTileData(targetX, targetY, point.z);
                            if (targetTileData && !targetTileData[0].fishAvailable) {
                                return false;
                            }
                            targetPoints.push({ x: targetX, y: targetY, z: point.z });
                        }
                        for (const targetPoint of targetPoints) {
                            const checkTiles = 16;
                            const fillCount = context.island.checkWaterFill(targetPoint.x, targetPoint.y, targetPoint.z, checkTiles, IIsland_1.WaterType.None);
                            if (fillCount < checkTiles) {
                                return false;
                            }
                        }
                        break;
                }
                if (navigation.isDisabledFromPoint(point)) {
                    return false;
                }
                return true;
            });
            if (!target) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return new MoveToTarget_1.default(target, this.options?.moveToAdjacentTile ? true : false, {
                allowBoat: !this.options?.disallowBoats,
                disableStaminaCheck: true,
            });
        }
    }
    exports.default = MoveToWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY0EsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLDZEQUFRLENBQUE7UUFDUix1RUFBYSxDQUFBO1FBQ2IsdUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtJQVFELE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixTQUEwQixFQUFtQixPQUFzQztZQUMvRyxLQUFLLEVBQUUsQ0FBQztZQURvQixjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVoSCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7UUFDM0csQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hHLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtnQkFFdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxlQUFlLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6RyxPQUFPLDRCQUFlLENB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
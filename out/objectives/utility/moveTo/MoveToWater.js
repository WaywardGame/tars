define(["require", "exports", "game/island/IIsland", "game/tile/ITerrain", "utilities/math/Vector2", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, IIsland_1, ITerrain_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
            const target = context.getTile().findMatchingTile((tile) => {
                if (disabledTiles.has(tile)) {
                    return false;
                }
                const tileType = tile.type;
                const terrainDescription = tile.description();
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
                        const result = tile.canSailAwayFrom();
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
                        const tileData = tile.getTileData();
                        if (tileData && !tileData[0].fishAvailable) {
                            return false;
                        }
                        const standableNearbyPoints = [];
                        for (const nearbyTile of tile.getTilesAround()) {
                            const nearbyTerrainDescription = nearbyTile.description();
                            if ((nearbyTerrainDescription?.shallowWater || !nearbyTerrainDescription?.water) && !navigation.isDisabled(nearbyTile)) {
                                standableNearbyPoints.push(nearbyTile);
                            }
                        }
                        if (standableNearbyPoints.length === 0) {
                            return false;
                        }
                        const targetTiles = [];
                        for (const standableNearbyPoint of standableNearbyPoints) {
                            const direction = Vector2_1.default.DIRECTIONS[context.island.getDirectionFromMovement(tile.x - standableNearbyPoint.x, tile.y - standableNearbyPoint.y)];
                            const targetX = standableNearbyPoint.x + (direction.x * (this.options?.fishingRange ?? 1));
                            const targetY = standableNearbyPoint.y + (direction.y * (this.options?.fishingRange ?? 1));
                            const targetTile = context.island.getTile(targetX, targetY, tile.z);
                            const targetTerrainDescription = targetTile.description();
                            if (targetTerrainDescription?.shallowWater || !targetTerrainDescription?.water) {
                                return false;
                            }
                            const targetTileData = targetTile.getTileData();
                            if (targetTileData && !targetTileData[0].fishAvailable) {
                                return false;
                            }
                            targetTiles.push(targetTile);
                        }
                        for (const targetTile of targetTiles) {
                            const checkTiles = 16;
                            const fillCount = context.island.checkWaterFill(targetTile, checkTiles, IIsland_1.WaterType.None);
                            if (fillCount < checkTiles) {
                                return false;
                            }
                        }
                        break;
                }
                if (navigation.isDisabled(tile)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBWUEsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLDZEQUFRLENBQUE7UUFDUix1RUFBYSxDQUFBO1FBQ2IsdUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtJQVFELE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixTQUEwQixFQUFtQixPQUFzQztZQUMvRyxLQUFLLEVBQUUsQ0FBQztZQURvQixjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVoSCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7UUFDM0csQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hHLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtnQkFFdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxlQUFlLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6RyxPQUFPLDRCQUFlLENB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
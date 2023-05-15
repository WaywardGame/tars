/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/island/IIsland", "game/tile/ITerrain", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, IIsland_1, ITerrain_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
            const fishingRange = this.options?.fishingRange ?? 1;
            const disabledTiles = new Set();
            const target = context.getTile().findMatchingTile((tile) => {
                if (disabledTiles.has(tile)) {
                    return false;
                }
                const tileType = tile.type;
                const terrainDescription = tile.description;
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
                        const standableNearbyTiles = [];
                        for (const nearbyTile of tile.getTilesAround()) {
                            if (!navigation.isDisabled(nearbyTile) && (!nearbyTile.doodad || (!nearbyTile.doodad.blocksMove() && !nearbyTile.doodad.isDangerous(context.human)))) {
                                standableNearbyTiles.push(nearbyTile);
                            }
                        }
                        if (standableNearbyTiles.length === 0) {
                            return false;
                        }
                        const targetTiles = [];
                        for (const standableNearbyTile of standableNearbyTiles) {
                            const direction = context.island.getDirectionFromMovement(tile.x - standableNearbyTile.x, tile.y - standableNearbyTile.y);
                            const mobCheck = context.island.checkForTargetInRange(standableNearbyTile, direction, fishingRange);
                            if (mobCheck.noTile || mobCheck.obstacle || (mobCheck.creature && !mobCheck.creature.description?.fishable)) {
                                return false;
                            }
                            const targetTile = mobCheck.tile;
                            const targetTerrainDescription = targetTile.description;
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
                        const nearbyTiles = tile.tilesInRange(16, true);
                        for (const tile of nearbyTiles) {
                            if (tile.creature && context.utilities.creature.isScaredOfCreature(context, tile.creature)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBWUgsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLDZEQUFRLENBQUE7UUFDUix1RUFBYSxDQUFBO1FBQ2IsdUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtJQVFELE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixTQUEwQixFQUFtQixPQUFzQztZQUMvRyxLQUFLLEVBQUUsQ0FBQztZQURvQixjQUFTLEdBQVQsU0FBUyxDQUFpQjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVoSCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7UUFDM0csQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hHLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtnQkFFdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxlQUFlLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dC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
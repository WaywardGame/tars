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
    })(MoveToWaterType || (exports.MoveToWaterType = MoveToWaterType = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBWUgsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLDZEQUFRLENBQUE7UUFDUix1RUFBYSxDQUFBO1FBQ2IsdUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVyxlQUFlLCtCQUFmLGVBQWUsUUFJMUI7SUFRRCxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBNkIsU0FBMEIsRUFBbUIsT0FBc0M7WUFDL0csS0FBSyxFQUFFLENBQUM7WUFEb0IsY0FBUyxHQUFULFNBQVMsQ0FBaUI7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFFaEgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1FBQzNHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoRyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7Z0JBRXZDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssZUFBZSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDekcsT0FBTyw0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
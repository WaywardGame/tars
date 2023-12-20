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
define(["require", "exports", "@wayward/game/game/island/IIsland", "@wayward/game/game/tile/ITerrain", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, IIsland_1, ITerrain_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
                        const result = tile.canSailAwayFrom(context.human);
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
                            if (!navigation.isDisabled(nearbyTile) && (!nearbyTile.doodad || (!nearbyTile.doodad.blocksMove && !nearbyTile.doodad.isDangerous(context.human)))) {
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
                            if (fillCount.count < checkTiles) {
                                return false;
                            }
                        }
                        const nearbyTiles = tile.tilesInRange(16, true);
                        for (const tile of nearbyTiles) {
                            if (tile.creature && context.utilities.creature.isScaredOfCreature(context.human, tile.creature)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBWUgsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLDZEQUFRLENBQUE7UUFDUix1RUFBYSxDQUFBO1FBQ2IsdUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVyxlQUFlLCtCQUFmLGVBQWUsUUFJMUI7SUFRRCxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBNkIsU0FBMEIsRUFBbUIsT0FBc0M7WUFDL0csS0FBSyxFQUFFLENBQUM7WUFEb0IsY0FBUyxHQUFULFNBQVMsQ0FBaUI7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFFaEgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1FBQzNHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoRyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFFeEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLGVBQWUsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FB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
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
define(["require", "exports", "@wayward/game/game/tile/ITerrain", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "@wayward/game/game/entity/action/actions/Till", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../tile/DigTile", "../../core/Lambda", "../tile/ClearTile", "../../acquire/item/AcquireInventoryItem", "../item/UseItem"], function (require, exports, ITerrain_1, Dictionary_1, Translation_1, Till_1, IObjective_1, Objective_1, MoveToTarget_1, DigTile_1, Lambda_1, ClearTile_1, AcquireInventoryItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class TillForSeed extends Objective_1.default {
        constructor(itemType, maxTilesChecked = exports.gardenMaxTilesChecked) {
            super();
            this.itemType = itemType;
            this.maxTilesChecked = maxTilesChecked;
        }
        getIdentifier() {
            return `TillForSeed:${this.itemType}`;
        }
        getStatus() {
            return `Tilling to plant ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`;
        }
        async execute(context) {
            const result = this.getTillObjectives(context);
            if (result === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new AcquireInventoryItem_1.default("hoe"),
                ...result,
            ];
        }
        getTillObjectives(context) {
            const allowedTilesSet = context.utilities.tile.getSeedAllowedTileSet(this.itemType);
            if (allowedTilesSet.size === 0) {
                return undefined;
            }
            const emptyTilledTile = context.utilities.base.getBaseTile(context).findMatchingTile((tile) => allowedTilesSet.has(tile.type) &&
                tile.isTilled &&
                tile.isEmpty &&
                tile.isOpen, {
                maxTilesChecked: this.maxTilesChecked
            });
            if (emptyTilledTile !== undefined) {
                return [
                    new MoveToTarget_1.default(emptyTilledTile, true),
                    new ClearTile_1.default(emptyTilledTile),
                ];
            }
            let tile;
            const facingTile = context.human.facingTile;
            if (context.utilities.tile.canTill(context, facingTile, context.inventory.hoe, allowedTilesSet)) {
                tile = facingTile;
            }
            else {
                tile = context.utilities.tile.getNearbyTillableTile(context, this.itemType, allowedTilesSet);
            }
            if (!tile) {
                return undefined;
            }
            let objectives = [];
            if (tile.type === ITerrain_1.TerrainType.Grass) {
                objectives.push(new DigTile_1.default(tile, { digUntilTypeIsNot: ITerrain_1.TerrainType.Grass }));
            }
            objectives.push(new MoveToTarget_1.default(tile, true), new UseItem_1.default(Till_1.default, "hoe"), new Lambda_1.default(async (context) => {
                const facingPoint = context.human.facingTile;
                if (facingPoint.isTilled) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                this.log.info("Not tilled yet");
                return IObjective_1.ObjectiveResult.Restart;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = TillForSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsbEZvclNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci90aWxlL1RpbGxGb3JTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFvQlUsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFMUMsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLFFBQWtCLEVBQW1CLGtCQUFzQyw2QkFBcUI7WUFDNUgsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7UUFFN0gsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sb0JBQW9CLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQzdGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztZQUNuQyxDQUFDO1lBRUQsT0FBTztnQkFDTixJQUFJLDhCQUFvQixDQUFDLEtBQUssQ0FBQztnQkFDL0IsR0FBRyxNQUFNO2FBQ1QsQ0FBQztRQUNILENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUN6QyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFD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
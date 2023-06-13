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
define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/tile/ITerrain", "language/Dictionary", "language/Translation", "game/item/ItemDescriptions", "game/entity/action/actions/Till", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../tile/DigTile", "../../core/Lambda", "../tile/ClearTile", "../../acquire/item/AcquireInventoryItem", "../item/UseItem"], function (require, exports, Doodads_1, IAction_1, ITerrain_1, Dictionary_1, Translation_1, ItemDescriptions_1, Till_1, IObjective_1, Objective_1, MoveToTarget_1, DigTile_1, Lambda_1, ClearTile_1, AcquireInventoryItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class TillForSeed extends Objective_1.default {
        constructor(itemType, maxTilesChecked = exports.gardenMaxTilesChecked) {
            super();
            this.itemType = itemType;
            this.maxTilesChecked = maxTilesChecked;
            this.allowedTilesSet = new Set(Doodads_1.doodadDescriptions[ItemDescriptions_1.itemDescriptions[this.itemType]?.onUse?.[IAction_1.ActionType.Plant]]?.allowedTiles ?? []);
        }
        getIdentifier() {
            return `TillForSeed:${Array.from(this.allowedTilesSet).join(",")}`;
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
            if (this.allowedTilesSet.size === 0) {
                return undefined;
            }
            const emptyTilledTile = context.utilities.base.getBaseTile(context).findMatchingTile((tile) => this.allowedTilesSet.has(tile.type) &&
                tile.isTilled &&
                tile.isEmpty &&
                tile.isOpenTile, {
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
            if (context.utilities.tile.canTill(context, facingTile, context.inventory.hoe, this.allowedTilesSet)) {
                tile = facingTile;
            }
            else {
                const nearbyTillableTile = context.utilities.base.getBaseTile(context).findMatchingTile((tile) => context.utilities.tile.canTill(context, tile, context.inventory.hoe, this.allowedTilesSet), {
                    maxTilesChecked: exports.gardenMaxTilesChecked,
                });
                if (!nearbyTillableTile) {
                    return undefined;
                }
                tile = nearbyTillableTile;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsbEZvclNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci90aWxlL1RpbGxGb3JTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUF1QlUsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFMUMsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBSTlDLFlBQTZCLFFBQWtCLEVBQW1CLGtCQUFzQyw2QkFBcUI7WUFDekgsS0FBSyxFQUFFLENBQUM7WUFEaUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7WUFJekgsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyw0QkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4SSxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGVBQWUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLG9CQUFvQixxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFD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
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
define(["require", "exports", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/tile/ITerrain", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/game/entity/action/actions/Till", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../tile/DigTile", "../../core/Lambda", "../tile/ClearTile", "../../acquire/item/AcquireInventoryItem", "../item/UseItem"], function (require, exports, Doodads_1, IAction_1, ITerrain_1, Dictionary_1, Translation_1, ItemDescriptions_1, Till_1, IObjective_1, Objective_1, MoveToTarget_1, DigTile_1, Lambda_1, ClearTile_1, AcquireInventoryItem_1, UseItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsbEZvclNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci90aWxlL1RpbGxGb3JTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUF1QlUsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFMUMsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBSWpELFlBQTZCLFFBQWtCLEVBQW1CLGtCQUFzQyw2QkFBcUI7WUFDNUgsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7WUFJNUgsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyw0QkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcEUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLG9CQUFvQixxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUM3RixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sNEJBQWUsQ0FBQyxVQUFV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
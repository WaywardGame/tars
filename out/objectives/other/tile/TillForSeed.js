define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/tile/ITerrain", "utilities/game/TileHelpers", "language/Dictionary", "language/Translation", "game/item/ItemDescriptions", "game/entity/action/actions/Till", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../tile/DigTile", "../../core/Lambda", "../tile/ClearTile", "../../acquire/item/AcquireInventoryItem", "../item/UseItem"], function (require, exports, Doodads_1, IAction_1, ITerrain_1, TileHelpers_1, Dictionary_1, Translation_1, ItemDescriptions_1, Till_1, IObjective_1, Objective_1, MoveToTarget_1, DigTile_1, Lambda_1, ClearTile_1, AcquireInventoryItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class TillForSeed extends Objective_1.default {
        constructor(itemType, maxTilesChecked = exports.gardenMaxTilesChecked) {
            super();
            this.itemType = itemType;
            this.maxTilesChecked = maxTilesChecked;
            this.allowedTilesSet = new Set(Doodads_1.default[ItemDescriptions_1.itemDescriptions[this.itemType]?.onUse?.[IAction_1.ActionType.Plant]]?.allowedTiles ?? []);
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
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(context.island, context.utilities.base.getBasePosition(context), (island, point, tile) => this.allowedTilesSet.has(TileHelpers_1.default.getType(tile)) &&
                island.isTilled(point.x, point.y, point.z) &&
                island.isTileEmpty(tile) &&
                TileHelpers_1.default.isOpenTile(island, point, tile), {
                maxTilesChecked: this.maxTilesChecked
            });
            if (emptyTilledTile !== undefined) {
                return [
                    new MoveToTarget_1.default(emptyTilledTile, true),
                    new ClearTile_1.default(emptyTilledTile),
                ];
            }
            let tile;
            let point;
            const facingTile = context.human.getFacingTile();
            const facingPoint = context.human.getFacingPoint();
            if (context.utilities.tile.canTill(context, facingPoint, facingTile, context.inventory.hoe, this.allowedTilesSet)) {
                tile = facingTile;
                point = facingPoint;
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTile(context.island, context.utilities.base.getBasePosition(context), (_, point, tile) => context.utilities.tile.canTill(context, point, tile, context.inventory.hoe, this.allowedTilesSet), {
                    maxTilesChecked: exports.gardenMaxTilesChecked,
                });
                if (!nearbyTillableTile) {
                    return undefined;
                }
                const target = nearbyTillableTile;
                point = target;
                tile = context.island.getTileFromPoint(target);
            }
            let objectives = [];
            if (TileHelpers_1.default.getType(tile) === ITerrain_1.TerrainType.Grass) {
                objectives.push(new DigTile_1.default(point, { digUntilTypeIsNot: ITerrain_1.TerrainType.Grass }));
            }
            objectives.push(new MoveToTarget_1.default(point, true), new UseItem_1.default(Till_1.default, "hoe"), new Lambda_1.default(async (context) => {
                const facingPoint = context.human.getFacingPoint();
                if (context.human.island.isTilled(facingPoint.x, facingPoint.y, facingPoint.z)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsbEZvclNlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci90aWxlL1RpbGxGb3JTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFxQmEsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFMUMsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBSTlDLFlBQTZCLFFBQWtCLEVBQW1CLGtCQUFzQyw2QkFBcUI7WUFDekgsS0FBSyxFQUFFLENBQUM7WUFEaUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7WUFJekgsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4SSxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGVBQWUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLG9CQUFvQixxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsT0FBTztn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
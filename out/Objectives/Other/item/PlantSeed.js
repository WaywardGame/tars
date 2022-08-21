define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "language/Dictionary", "language/Translation", "game/item/ItemDescriptions", "game/entity/action/actions/Plant", "game/entity/action/actions/Till", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../tile/DigTile", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../core/Lambda", "../tile/ClearTile", "../../acquire/item/AcquireInventoryItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Dictionary_1, Translation_1, ItemDescriptions_1, Plant_1, Till_1, IObjective_1, Objective_1, MoveToTarget_1, DigTile_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, Lambda_1, ClearTile_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class PlantSeed extends Objective_1.default {
        constructor(itemOrItemType, maxTilesChecked = exports.gardenMaxTilesChecked) {
            super();
            this.itemOrItemType = itemOrItemType;
            this.maxTilesChecked = maxTilesChecked;
        }
        getIdentifier() {
            return `PlantSeed:${typeof (this.itemOrItemType) === "number" ? IItem_1.ItemType[this.itemOrItemType] : this.itemOrItemType}`;
        }
        getStatus() {
            return `Planting ${typeof (this.itemOrItemType) === "number" ? Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemOrItemType).getString() : this.itemOrItemType.getName()}`;
        }
        async execute(context) {
            const result = this.getTillObjectives(context);
            if (result === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const item = typeof (this.itemOrItemType) === "number" ? this.getAcquiredItem(context) : this.itemOrItemType;
            if (!item?.isValid()) {
                this.log.error("Invalid seed item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectives = [
                new ReserveItems_1.default(item).keepInInventory(),
                new MoveItemIntoInventory_1.default(item),
                new AcquireInventoryItem_1.default("hoe"),
            ];
            objectives.push(...result, new UseItem_1.default(Plant_1.default, item));
            return objectives;
        }
        getTillObjectives(context) {
            const itemType = typeof (this.itemOrItemType) === "number" ? this.itemOrItemType : this.itemOrItemType.type;
            const allowedTiles = Doodads_1.default[ItemDescriptions_1.itemDescriptions[itemType]?.onUse?.[IAction_1.ActionType.Plant]]?.allowedTiles;
            if (!allowedTiles) {
                return undefined;
            }
            const allowedTilesSet = new Set(allowedTiles);
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(context.island, context.utilities.base.getBasePosition(context), (island, point, tile) => {
                return island.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(island, point, tile) &&
                    island.isTilled(point.x, point.y, point.z) &&
                    allowedTiles.includes(TileHelpers_1.default.getType(tile));
            }, { maxTilesChecked: this.maxTilesChecked });
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
            if (context.utilities.tile.canTill(context, facingPoint, facingTile, context.inventory.hoe, allowedTilesSet)) {
                tile = facingTile;
                point = facingPoint;
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(context.island, context.utilities.base.getBasePosition(context), (_, point, tile) => context.utilities.tile.canTill(context, point, tile, context.inventory.hoe, allowedTilesSet), {
                    maxTilesChecked: exports.gardenMaxTilesChecked,
                    maxTiles: 1,
                });
                if (nearbyTillableTile.length === 0) {
                    return undefined;
                }
                const target = nearbyTillableTile[0];
                tile = target.tile;
                point = target.point;
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
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXlCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsY0FBK0IsRUFBbUIsa0JBQXNDLDZCQUFxQjtZQUN6SSxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQTRDO1FBRTFJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2SCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sWUFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDdkssQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sSUFBSSxHQUFHLE9BQU8s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
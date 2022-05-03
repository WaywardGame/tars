define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITerrain", "utilities/game/TileHelpers", "language/Dictionary", "language/Translation", "game/item/Items", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../contextData/SetContextData", "../../core/MoveToTarget", "../tile/DigTile", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../analyze/AnalyzeInventory", "../../core/Lambda", "../tile/ClearTile"], function (require, exports, Doodads_1, IAction_1, IItem_1, ITerrain_1, TileHelpers_1, Dictionary_1, Translation_1, Items_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, MoveToTarget_1, DigTile_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, AnalyzeInventory_1, Lambda_1, ClearTile_1) {
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
            ];
            if (context.inventory.hoe) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe).setContextDataKey(IContext_1.ContextDataType.Item1), new AnalyzeInventory_1.default());
            }
            objectives.push(...result, new UseItem_1.default(IAction_1.ActionType.Plant, item));
            return objectives;
        }
        getTillObjectives(context) {
            const itemType = typeof (this.itemOrItemType) === "number" ? this.itemOrItemType : this.itemOrItemType.type;
            const allowedTiles = Doodads_1.default[Items_1.default[itemType]?.onUse?.[IAction_1.ActionType.Plant]]?.allowedTiles;
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
            if (context.utilities.tile.canTill(context, facingPoint, facingTile, allowedTilesSet)) {
                tile = facingTile;
                point = facingPoint;
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTiles(context.island, context.utilities.base.getBasePosition(context), (_, point, tile) => context.utilities.tile.canTill(context, point, tile, allowedTilesSet), {
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
            objectives.push(new MoveToTarget_1.default(point, true), new UseItem_1.default(IAction_1.ActionType.Till).setContextDataKey(IContext_1.ContextDataType.Item1), new Lambda_1.default(async (context) => {
                const facingPoint = context.human.getFacingPoint();
                if (context.human.island.isTilled(facingPoint.x, facingPoint.y, facingPoint.z)) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                this.log.info("Not tilled yet");
                return IObjective_1.ObjectiveResult.Restart;
            }));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQTBCYSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsY0FBK0IsRUFBbUIsa0JBQXNDLDZCQUFxQjtZQUN6SSxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQTRDO1FBRTFJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2SCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sWUFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDdkssQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sSUFBSSxHQUFHLE9BQU8s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
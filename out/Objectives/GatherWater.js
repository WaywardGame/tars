var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../Navigation", "../Objective", "../Utilities/Movement", "../Utilities/Tile", "./ExecuteAction", "utilities/TilePosition"], function (require, exports, IAction_1, IObjective_1, Navigation_1, Objective_1, Movement_1, Tile_1, ExecuteAction_1, TilePosition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWater extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getHashCode() {
            return `GatherWater:${this.item && this.item.getName(false).getString()}`;
        }
        onExecute(base) {
            return __awaiter(this, void 0, void 0, function* () {
                for (const well of base.wells) {
                    const wellData = game.wellData[TilePosition_1.getTileId(well.x, well.y, well.z)];
                    if (wellData && (wellData.quantity >= 1 || wellData.quantity === -1)) {
                        this.log.info("Gather water from a well");
                        const moveResult = yield Movement_1.moveToFaceTarget(well);
                        if (moveResult !== Movement_1.MoveResult.NoPath) {
                            if (moveResult === Movement_1.MoveResult.Moving) {
                                return;
                            }
                            this.log.info("Gather water from the well");
                            return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, action => action.execute(localPlayer, this.item, IAction_1.ActionType.GatherWater));
                        }
                        else {
                            this.log.info("No path to well");
                        }
                    }
                }
                const targets = yield Tile_1.getNearestTileLocation(Navigation_1.anyWaterTileLocation, localPlayer);
                const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                    for (let i = 0; i < 5; i++) {
                        const target = targets[i];
                        if (target) {
                            const targetTile = game.getTileFromPoint(target.point);
                            if (ignoredTiles.indexOf(targetTile) === -1) {
                                return target.point;
                            }
                        }
                    }
                    return undefined;
                });
                if (moveResult === Movement_1.MoveResult.NoTarget) {
                    this.log.info("Can't find water");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                else if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("Can't path to water");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                else if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                this.log.info("Gather water");
                if (game.isTileFull(localPlayer.getFacingTile())) {
                    this.log.info("Tile is full, pickup all items first");
                    return new ExecuteAction_1.default(IAction_1.ActionType.PickupAllItems, action => action.execute(localPlayer));
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, action => action.execute(localPlayer, this.item, IAction_1.ActionType.GatherWater));
            });
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWFBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87UUFFeEMsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVc7O2dCQUVqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFNLEVBQUU7b0JBQy9CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xFLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO3dCQUUxQyxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTs0QkFDckMsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7Z0NBQ3JDLE9BQU87NkJBQ1A7NEJBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJB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
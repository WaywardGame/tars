var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../IObjective", "../ITars", "../Objective", "./ExecuteAction", "../Utilities/Movement"], function (require, exports, Enums_1, Vector2_1, IObjective_1, ITars_1, Objective_1, ExecuteAction_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getHashCode() {
            return `GatherFromGround:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const itemsOnTheGround = game.items
                    .filter(item => {
                    if (item && item.type === this.itemType && itemManager.isTileContainer(item.containedWithin)) {
                        const container = item.containedWithin;
                        return container.z === localPlayer.z && container.y < ITars_1.desertCutoff;
                    }
                    return false;
                })
                    .sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a.containedWithin) > Vector2_1.default.squaredDistance(localPlayer, b.containedWithin) ? 1 : -1);
                if (calculateDifficulty) {
                    const target = itemsOnTheGround[0];
                    return target === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.squaredDistance(localPlayer, target.containedWithin));
                }
                if (itemsOnTheGround.length > 0) {
                    const tile = localPlayer.getTile();
                    if (tile.containedItems !== undefined && tile === itemsOnTheGround[0].containedWithin) {
                        const pickupItem = tile.containedItems[tile.containedItems.length - 1];
                        if (pickupItem.type === this.itemType) {
                            return new ExecuteAction_1.default(Enums_1.ActionType.Idle);
                        }
                    }
                }
                const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                    for (let i = 0; i < itemsOnTheGround.length; i++) {
                        const target = itemsOnTheGround[i];
                        const targetTile = target.containedWithin;
                        if (ignoredTiles.indexOf(targetTile) === -1) {
                            return targetTile;
                        }
                    }
                    return undefined;
                });
                if (moveResult === Movement_1.MoveResult.NoTarget) {
                    this.log.info("Can't find ground tile nearby");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("Can't find path to ground tile");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                const facingTile = localPlayer.getFacingTile();
                if (facingTile.containedItems !== undefined && facingTile.containedItems[facingTile.containedItems.length - 1].type === this.itemType) {
                    return new ExecuteAction_1.default(Enums_1.ActionType.PickupItem);
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.PickupAllItems);
            });
        }
        getBaseDifficulty(base, inventory) {
            return 6;
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlckZyb21Hcm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUFvQixRQUFrQjtZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURXLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFdEMsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxvQkFBb0IsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyRixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUs7cUJBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDZCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7d0JBQzdGLE1BQU0sU0FBUyxHQUFJLElBQUksQ0FBQyxlQUFtQyxDQUFDO3dCQUM1RCxPQUFPLFNBQVMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxHQUFHLG9CQUFZLENBQUM7cUJBQ25FO29CQUVELE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUMsQ0FBQztxQkFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLGVBQWtDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLGVBQWtDLENB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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../Helpers", "../IObjective", "../ITars", "../Objective", "./ExecuteAction"], function (require, exports, Enums_1, Vector2_1, Helpers, IObjective_1, ITars_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromGround extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getHashCode() {
            return `GatherFromGround:${Enums_1.ItemType[this.itemType]}`;
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
                const moveResult = yield Helpers.moveToTargetWithRetries((ignoredTiles) => {
                    for (let i = 0; i < itemsOnTheGround.length; i++) {
                        const target = itemsOnTheGround[i];
                        const targetTile = target.containedWithin;
                        if (ignoredTiles.indexOf(targetTile) === -1) {
                            return targetTile;
                        }
                    }
                    return undefined;
                });
                if (moveResult === ITars_1.MoveResult.NoTarget) {
                    this.log.info("Can't find ground tile nearby");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === ITars_1.MoveResult.NoPath) {
                    this.log.info("Can't find path to ground tile");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult !== ITars_1.MoveResult.Complete) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlckZyb21Hcm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxzQkFBc0MsU0FBUSxtQkFBUztRQUV0RCxZQUFvQixRQUFrQjtZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURXLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFdEMsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxvQkFBb0IsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUs7cUJBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDZCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7d0JBQzdGLE1BQU0sU0FBUyxHQUFJLElBQUksQ0FBQyxlQUFtQyxDQUFDO3dCQUM1RCxPQUFPLFNBQVMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxHQUFHLG9CQUFZLENBQUM7cUJBQ25FO29CQUVELE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUMsQ0FBQztxQkFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLGVBQWtDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLGVBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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
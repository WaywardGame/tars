var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "utilities/math/Vector2", "../IObjective", "../ITars", "../Objective", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, IAction_1, Vector2_1, IObjective_1, ITars_1, Objective_1, Movement_1, ExecuteAction_1) {
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
                    .sort((a, b) => Vector2_1.default.distance(localPlayer, a.containedWithin) > Vector2_1.default.distance(localPlayer, b.containedWithin) ? 1 : -1);
                if (calculateDifficulty) {
                    const target = itemsOnTheGround[0];
                    return target === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.distance(localPlayer, target.containedWithin));
                }
                if (itemsOnTheGround.length > 0) {
                    const tile = localPlayer.getTile();
                    if (tile.containedItems !== undefined && tile === itemsOnTheGround[0].containedWithin) {
                        const pickupItem = tile.containedItems[tile.containedItems.length - 1];
                        if (pickupItem.type === this.itemType) {
                            return new ExecuteAction_1.default(IAction_1.ActionType.Idle, action => action.execute(localPlayer));
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
                    return new ExecuteAction_1.default(IAction_1.ActionType.PickupItem, action => action.execute(localPlayer));
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.PickupAllItems, action => action.execute(localPlayer));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 6;
        }
    }
    exports.default = GatherFromGround;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUdyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlckZyb21Hcm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFXQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sb0JBQW9CLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckYsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLO3FCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2QsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO3dCQUM3RixNQUFNLFNBQVMsR0FBSSxJQUFJLENBQUMsZUFBbUMsQ0FBQzt3QkFDNUQsT0FBTyxTQUFTLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxvQkFBWSxDQUFDO3FCQUNuRTtvQkFFRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDLENBQUM7cUJBQ0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxlQUFrQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxlQUFrQyxD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
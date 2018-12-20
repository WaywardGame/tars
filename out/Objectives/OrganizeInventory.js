var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Item", "../Utilities/Movement", "../Utilities/Tile", "./ExecuteAction"], function (require, exports, IAction_1, Vector2_1, IObjective_1, Objective_1, Item_1, Movement_1, Tile_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const maxChestDistance = 128;
    class OrganizeInventory extends Objective_1.default {
        constructor(fromReduceWeightInterrupt, allowChests = true) {
            super();
            this.fromReduceWeightInterrupt = fromReduceWeightInterrupt;
            this.allowChests = allowChests;
        }
        getHashCode() {
            return "OrganizeInventory";
        }
        shouldSaveChildObjectives() {
            return false;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                let unusedItems = Item_1.getUnusedItems(inventory);
                const unusedExtraItems = unusedItems.filter(item => unusedItems.filter(i => i.type === item.type).length >= 3);
                if (unusedExtraItems.length > 0) {
                    unusedItems = unusedExtraItems;
                }
                else if (!this.fromReduceWeightInterrupt) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (unusedItems.length === 0) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const itemToDrop = unusedItems[0];
                let moveResult;
                if (this.allowChests && base.chests !== undefined && base.chests.length > 0) {
                    const chests = base.chests.sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                    for (const chest of chests) {
                        if (Vector2_1.default.squaredDistance(localPlayer, chest) > maxChestDistance) {
                            continue;
                        }
                        const targetContainer = chest;
                        if (itemManager.computeContainerWeight(targetContainer) + itemToDrop.weight > targetContainer.weightCapacity) {
                            continue;
                        }
                        moveResult = yield Movement_1.moveToFaceTarget(chest);
                        if (moveResult === Movement_1.MoveResult.NoPath) {
                            continue;
                        }
                        if (moveResult !== Movement_1.MoveResult.Complete) {
                            this.log.info("Moving");
                            return;
                        }
                        this.log.info(`Moving item ${itemToDrop.getName()} into chest`);
                        return new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, action => action.execute(localPlayer, itemToDrop, undefined, targetContainer), false);
                    }
                }
                moveResult = yield Movement_1.findAndMoveToTarget((point, tile) => Tile_1.isOpenTile(point, tile) && !game.isTileFull(tile));
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    this.log.info("Moving to drop position");
                    return;
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.Drop, action => action.execute(localPlayer, itemToDrop));
            });
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9Pcmdhbml6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWNBLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBRTdCLE1BQXFCLGlCQUFrQixTQUFRLG1CQUFTO1FBRXZELFlBQTZCLHlCQUFrQyxFQUFtQixjQUF1QixJQUFJO1lBQzVHLEtBQUssRUFBRSxDQUFDO1lBRG9CLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBUztZQUFtQixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFFN0csQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFdBQVcsR0FBRyxxQkFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUU1QyxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztpQkFFL0I7cUJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtvQkFDM0MsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDN0IsT0FBTyw0QkFBZSxDQUFD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
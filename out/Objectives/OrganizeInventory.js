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
    const maxChestDistance = 128;
    class OrganizeInventory extends Objective_1.default {
        constructor(fromReduceWeightInterrupt, allowChests = true) {
            super();
            this.fromReduceWeightInterrupt = fromReduceWeightInterrupt;
            this.allowChests = allowChests;
        }
        shouldSaveChildObjectives() {
            return false;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                let unusedItems = Helpers.getUnusedItems(inventory);
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
                        const container = chest;
                        if (itemManager.computeContainerWeight(container) + itemToDrop.weight > container.weightCapacity) {
                            continue;
                        }
                        moveResult = yield Helpers.moveToTarget(chest);
                        if (moveResult === ITars_1.MoveResult.NoPath) {
                            continue;
                        }
                        if (moveResult !== ITars_1.MoveResult.Complete) {
                            this.log.info("Moving");
                            return;
                        }
                        this.log.info(`Moving item ${game.getName(itemToDrop)} into chest`);
                        return new ExecuteAction_1.default(Enums_1.ActionType.MoveItem, {
                            item: itemToDrop,
                            targetContainer: container
                        }, false);
                    }
                }
                moveResult = yield Helpers.findAndMoveToTarget((point, tile) => Helpers.isOpenTile(point, tile) && !game.isTileFull(tile), true);
                if (moveResult !== ITars_1.MoveResult.Complete) {
                    this.log.info("Moving to drop position");
                    return;
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.Drop, {
                    item: itemToDrop
                });
            });
        }
    }
    exports.default = OrganizeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9Pcmdhbml6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVdBLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBRTdCLHVCQUF1QyxTQUFRLG1CQUFTO1FBRXZELFlBQW9CLHlCQUFrQyxFQUFVLGNBQXVCLElBQUk7WUFDMUYsS0FBSyxFQUFFLENBQUM7WUFEVyw4QkFBeUIsR0FBekIseUJBQXlCLENBQVM7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFFM0YsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFcEQsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0csSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNoQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7aUJBRS9CO3FCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUU7b0JBQzNDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzdCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sVUFBVSxHQUFHLFdBQVcs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
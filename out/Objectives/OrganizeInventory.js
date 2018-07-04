var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../IObjective", "../Objective", "./ExecuteAction", "../Utilities/Movement", "../Utilities/Tile", "../Utilities/Item"], function (require, exports, Enums_1, Vector2_1, IObjective_1, Objective_1, ExecuteAction_1, Movement_1, Tile_1, Item_1) {
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
                        const container = chest;
                        if (itemManager.computeContainerWeight(container) + itemToDrop.weight > container.weightCapacity) {
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
                        this.log.info(`Moving item ${game.getName(itemToDrop)} into chest`);
                        return new ExecuteAction_1.default(Enums_1.ActionType.MoveItem, {
                            item: itemToDrop,
                            targetContainer: container
                        }, false);
                    }
                }
                moveResult = yield Movement_1.findAndMoveToTarget((point, tile) => Tile_1.isOpenTile(point, tile) && !game.isTileFull(tile));
                if (moveResult !== Movement_1.MoveResult.Complete) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVJbnZlbnRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9Pcmdhbml6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWFBLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBRTdCLHVCQUF1QyxTQUFRLG1CQUFTO1FBRXZELFlBQW9CLHlCQUFrQyxFQUFVLGNBQXVCLElBQUk7WUFDMUYsS0FBSyxFQUFFLENBQUM7WUFEVyw4QkFBeUIsR0FBekIseUJBQXlCLENBQVM7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFFM0YsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFdBQVcsR0FBRyxxQkFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUU1QyxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztpQkFFL0I7cUJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtvQkFDM0MsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDN0IsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLFVBQXNCLENBQUM7Z0JBRTNCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzVFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0SSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTt3QkFDM0IsSUFBSSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEdBQUcsZ0JBQWdCLEVBQUU7NEJBQ25FLFNBQVM7eUJBQ1Q7d0JBRUQsTUFBTSxTQUFTLEdBQUcsS0FBbUIsQ0FBQzt3QkFDdEMsSUFBSSxXQUFXLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsY0FBZSxFQUFFOzRCQUNsRyxTQUFTO3lCQUNUO3dCQUVELFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUMzQyxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTs0QkFDckMsU0FBUzt5QkFDVDt3QkFFRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTs0QkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ3hCLE9BQU87eUJBQ1A7d0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFFcEUsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxRQUFRLEVBQUU7NEJBQzdDLElBQUksRUFBRSxVQUFVOzRCQUNoQixlQUFlLEVBQUUsU0FBUzt5QkFDMUIsRUFBRSxLQUFLLENBQUMsQ0FBQztxQkFDVjtpQkFDRDtnQkFFRCxVQUFVLEdBQUcsTUFBTSw4QkFBbUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRSxDQUFDLGlCQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM1SCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDekMsT0FBTztpQkFDUDtnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLElBQUksRUFBRTtvQkFDekMsSUFBSSxFQUFFLFVBQVU7aUJBQ2hCLENBQUMsQ0FBQztZQUNKLENBQUM7U0FBQTtLQUVEO0lBM0VELG9DQTJFQyJ9
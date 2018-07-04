var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../IObjective", "../Objective", "./ExecuteAction", "../Utilities/Movement"], function (require, exports, Enums_1, Vector2_1, IObjective_1, Objective_1, ExecuteAction_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getHashCode() {
            return `GatherFromChest:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (base.chests === undefined || base.chests.length === 0) {
                    if (calculateDifficulty) {
                        return IObjective_1.missionImpossible;
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const chestsWithItem = base.chests.filter(c => itemManager.getItemsInContainerByType(c, this.itemType, true, false).length > 0).sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                const chest = chestsWithItem[0];
                if (calculateDifficulty) {
                    return chest === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.squaredDistance(localPlayer, chest));
                }
                if (chest === undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToTargetWithRetries((ignoredTiles) => {
                    for (let i = 0; i < chestsWithItem.length; i++) {
                        const target = chestsWithItem[i];
                        const targetTile = target.getTile();
                        if (ignoredTiles.indexOf(targetTile) === -1) {
                            return target;
                        }
                    }
                    return undefined;
                });
                if (moveResult === Movement_1.MoveResult.NoTarget) {
                    this.log.info("Can't gather from chest nearby");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                else if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                const item = itemManager.getItemsInContainerByType(chest, this.itemType, true, false)[0];
                if (!item) {
                    this.log.warn("gather from chest bug?");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.MoveItem, {
                    item: item,
                    targetContainer: localPlayer.inventory
                });
            });
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRnJvbUNoZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEscUJBQXFDLFNBQVEsbUJBQVM7UUFFckQsWUFBb0IsUUFBa0I7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRXRDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sbUJBQW1CLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDMUQsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQztxQkFDekI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpQLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyw4QkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDekc7Z0JBRUQsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUN4QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLGtDQUF1QixDQUFDLENBQUMsWUFBcUIsRUFBRSxFQUFFO29CQUMxRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDL0MsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3BDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFDNUMsT0FBTyxNQUFNLENBQUM7eUJBQ2Q7cUJBQ0Q7b0JBRUQsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUVoQztxQkFBTSxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDOUMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkcsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUN4QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDN0MsSUFBSSxFQUFFLElBQUk7b0JBQ1YsZUFBZSxFQUFFLFdBQVcsQ0FBQyxTQUFTO2lCQUN0QyxDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FDRDtJQTdERCxrQ0E2REMifQ==
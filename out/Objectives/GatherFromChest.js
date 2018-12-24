var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, IAction_1, Vector2_1, IObjective_1, Objective_1, Movement_1, ExecuteAction_1) {
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
                const chestsWithItem = base.chests.filter(c => itemManager.getItemsInContainerByType(c, this.itemType, true).length > 0).sort((a, b) => Vector2_1.default.distance(localPlayer, a) > Vector2_1.default.distance(localPlayer, b) ? 1 : -1);
                const chest = chestsWithItem[0];
                if (calculateDifficulty) {
                    return chest === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.distance(localPlayer, chest));
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
                const item = itemManager.getItemsInContainerByType(chest, this.itemType, true)[0];
                if (!item) {
                    this.log.warn("gather from chest bug?");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, action => action.execute(localPlayer, item, undefined, localPlayer.inventory));
            });
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRnJvbUNoZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBV0EsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVyRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sbUJBQW1CLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDcEYsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDMUQsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQztxQkFDekI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcE8sTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLG1CQUFtQixFQUFFO29CQUN4QixPQUFPLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNsRztnQkFFRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sa0NBQXVCLENBQUMsQ0FBQyxZQUFxQixFQUFFLEVBQUU7b0JBQzFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMvQyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDcEMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFOzRCQUM1QyxPQUFPLE1BQU0sQ0FBQzt5QkFDZDtxQkFDRDtvQkFFRCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7b0JBQ2hELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBRWhDO3FCQUFNLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUM5QyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hHLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzlILENBQUM7U0FBQTtLQUNEO0lBMURELGtDQTBEQyJ9
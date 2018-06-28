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
    class GatherFromChest extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getHashCode() {
            return `GatherFromChest:${Enums_1.ItemType[this.itemType]}`;
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
                const moveResult = yield Helpers.moveToTargetWithRetries((ignoredTiles) => {
                    for (let i = 0; i < chestsWithItem.length; i++) {
                        const target = chestsWithItem[i];
                        const targetTile = target.getTile();
                        if (ignoredTiles.indexOf(targetTile) === -1) {
                            return target;
                        }
                    }
                    return undefined;
                });
                if (moveResult === ITars_1.MoveResult.NoTarget) {
                    this.log.info("Can't gather from chest nearby");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                else if (moveResult !== ITars_1.MoveResult.Complete) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRnJvbUNoZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEscUJBQXFDLFNBQVEsbUJBQVM7UUFFckQsWUFBb0IsUUFBa0I7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRXRDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDMUQsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQztxQkFDekI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpQLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyw4QkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDekc7Z0JBRUQsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUN4QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFlBQXFCLEVBQUUsRUFBRTtvQkFDbEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQy9DLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNwQyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7NEJBQzVDLE9BQU8sTUFBTSxDQUFDO3lCQUNkO3FCQUNEO29CQUVELE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztvQkFDaEQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFFaEM7cUJBQU0sSUFBSSxVQUFVLEtBQUssa0JBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQzlDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLEtBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZHLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDeEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQzdDLElBQUksRUFBRSxJQUFJO29CQUNWLGVBQWUsRUFBRSxXQUFXLENBQUMsU0FBUztpQkFDdEMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBQ0Q7SUE3REQsa0NBNkRDIn0=
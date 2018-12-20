var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../Navigation", "../Objective", "../Utilities/Movement", "../Utilities/Tile", "./ExecuteAction"], function (require, exports, IAction_1, IObjective_1, Navigation_1, Objective_1, Movement_1, Tile_1, ExecuteAction_1) {
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
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
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
                return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, action => action.execute(localPlayer, this.item, IAction_1.ActionType.GatherWater));
            });
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVdBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87UUFFeEMsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRVksU0FBUzs7Z0JBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sNkJBQXNCLENBQUMsaUNBQW9CLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRWhGLE1BQU0sVUFBVSxHQUFHLE1BQU0sc0NBQTJCLENBQUMsQ0FBQyxZQUFxQixFQUFFLEVBQUU7b0JBQzlFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzNCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxNQUFNLEVBQUU7NEJBQ1gsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDdkQsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dDQUM1QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7NkJBQ3BCO3lCQUNEO3FCQUNEO29CQUVELE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDbEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFFaEM7cUJBQU0sSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBRWhDO3FCQUFNLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUM5QyxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUU5QixPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hILENBQUM7U0FBQTtLQUNEO0lBM0NELDhCQTJDQyJ9
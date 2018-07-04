var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Navigation", "../Objective", "../Utilities/Tile", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, Enums_1, IObjective_1, Navigation_1, Objective_1, Tile_1, Movement_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWater extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getHashCode() {
            return `GatherWater:${game.getName(this.item, Enums_1.SentenceCaseStyle.Title, false)}`;
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
                return new ExecuteAction_1.default(Enums_1.ActionType.UseItem, {
                    item: this.item,
                    useActionType: Enums_1.ActionType.GatherWater
                });
            });
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVVBLGlCQUFpQyxTQUFRLG1CQUFTO1FBRWpELFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sZUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakYsQ0FBQztRQUVZLFNBQVM7O2dCQUNyQixNQUFNLE9BQU8sR0FBRyxNQUFNLDZCQUFzQixDQUFDLGlDQUFvQixFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUVoRixNQUFNLFVBQVUsR0FBRyxNQUFNLHNDQUEyQixDQUFDLENBQUMsWUFBcUIsRUFBRSxFQUFFO29CQUM5RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMzQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLElBQUksTUFBTSxFQUFFOzRCQUNYLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3ZELElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQ0FDNUMsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDOzZCQUNwQjt5QkFDRDtxQkFDRDtvQkFFRCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ2xDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBRWhDO3FCQUFNLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxFQUFFO29CQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUVoQztxQkFBTSxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDOUMsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFOUIsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxPQUFPLEVBQUU7b0JBQzVDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixhQUFhLEVBQUUsa0JBQVUsQ0FBQyxXQUFXO2lCQUNyQyxDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FDRDtJQTlDRCw4QkE4Q0MifQ==
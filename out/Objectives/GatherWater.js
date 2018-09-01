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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVVBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGVBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2pGLENBQUM7UUFFWSxTQUFTOztnQkFDckIsTUFBTSxPQUFPLEdBQUcsTUFBTSw2QkFBc0IsQ0FBQyxpQ0FBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFaEYsTUFBTSxVQUFVLEdBQUcsTUFBTSxzQ0FBMkIsQ0FBQyxDQUFDLFlBQXFCLEVBQUUsRUFBRTtvQkFDOUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDM0IsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLE1BQU0sRUFBRTs0QkFDWCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN2RCxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0NBQzVDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQzs2QkFDcEI7eUJBQ0Q7cUJBQ0Q7b0JBRUQsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUNsQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUVoQztxQkFBTSxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFDckMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFFaEM7cUJBQU0sSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQzlDLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRTlCLE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsT0FBTyxFQUFFO29CQUM1QyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsYUFBYSxFQUFFLGtCQUFVLENBQUMsV0FBVztpQkFDckMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBQ0Q7SUE5Q0QsOEJBOENDIn0=
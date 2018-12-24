var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "utilities/TileHelpers", "../IObjective", "../ITars", "../Objective", "../Utilities/Base", "../Utilities/Movement", "./AcquireItem", "./UseItem", "doodad/Doodads"], function (require, exports, IAction_1, Enums_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, Base_1, Movement_1, AcquireItem_1, UseItem_1, Doodads_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeed extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
        }
        getHashCode() {
            return `PlantSeed:${this.seed.getName(false).getString()}`;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (inventory.hoe === undefined) {
                    this.log.info("Acquire a stone hoe");
                    return new AcquireItem_1.default(Enums_1.ItemType.StoneHoe);
                }
                const description = this.seed.description();
                if (!description || !description.onUse) {
                    return;
                }
                const plantType = description.onUse[IAction_1.ActionType.Plant];
                const plantDescription = Doodads_1.default[plantType];
                if (!plantDescription) {
                    return;
                }
                const allowedTiles = plantDescription.allowedTiles;
                if (!allowedTiles) {
                    return;
                }
                const emptyTilledTile = yield Movement_1.findAndMoveToFaceTarget((point, tile) => {
                    const tileContainer = tile;
                    return tile.doodad === undefined &&
                        tile.corpses === undefined &&
                        TileHelpers_1.default.isOpenTile(point, tile) &&
                        TileHelpers_1.default.isTilled(tile) &&
                        allowedTiles.indexOf(TileHelpers_1.default.getType(tile)) !== -1 &&
                        (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
                }, ITars_1.gardenMaxTilesChecked, Base_1.getBasePosition(base));
                if (emptyTilledTile === Movement_1.MoveResult.NoTarget) {
                    const nearbyTillableTile = yield Movement_1.findAndMoveToFaceTarget((point, tile) => allowedTiles.indexOf(TileHelpers_1.default.getType(tile)) !== -1 && Base_1.isOpenArea(point, tile), ITars_1.gardenMaxTilesChecked, Base_1.getBasePosition(base));
                    if (nearbyTillableTile === Movement_1.MoveResult.NoTarget) {
                        this.log.info("No nearby dirt tile");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (nearbyTillableTile !== Movement_1.MoveResult.Complete) {
                        return;
                    }
                    this.log.info("Till a tile");
                    return new UseItem_1.default(inventory.hoe, IAction_1.ActionType.Till);
                }
                else if (emptyTilledTile === Movement_1.MoveResult.Complete) {
                    this.log.info(`Plant ${this.seed.getName(false).getString()}`);
                    return new UseItem_1.default(this.seed, IAction_1.ActionType.Plant);
                }
            });
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBZUEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLElBQVc7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUM1RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELElBQUksU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzFDO2dCQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sU0FBUyxHQUFlLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUN0QixPQUFPO2lCQUNQO2dCQUVELE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsT0FBTztpQkFDUDtnQkFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLGtDQUF1QixDQUFDLENBQUMsS0FBZSxFQUFFLElBQVcsRUFBRSxFQUFFO29CQUN0RixNQUFNLGFBQWEsR0FBRyxJQUFzQixDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDL0IsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTO3dCQUMxQixxQkFBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO3dCQUNuQyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQzFCLFlBQVksQ0FBQyxPQUFPLENBQUMscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3RELENBQUMsYUFBYSxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksYUFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLENBQUMsRUFBRSw2QkFBcUIsRUFBRSxzQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELElBQUksZUFBZSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUM1QyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sa0NBQXVCLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksaUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsNkJBQXFCLEVBQUUsc0JBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM1TixJQUFJLGtCQUFrQixLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3dCQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3FCQUNoQztvQkFFRCxJQUFJLGtCQUFrQixLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUMvQyxPQUFPO3FCQUNQO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUM3QixPQUFPLElBQUksaUJBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBRW5EO3FCQUFNLElBQUksZUFBZSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNoRDtZQUNGLENBQUM7U0FBQTtLQUVEO0lBN0RELDRCQTZEQyJ9
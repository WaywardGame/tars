var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/TileHelpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./UseItem", "../Utilities/Movement", "../Utilities/Base"], function (require, exports, Enums_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, AcquireItem_1, UseItem_1, Movement_1, Base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeed extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
        }
        getHashCode() {
            return `PlantSeed:${game.getName(this.seed, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (inventory.hoe === undefined) {
                    this.log.info("Acquire a stone hoe");
                    return new AcquireItem_1.default(Enums_1.ItemType.StoneHoe);
                }
                const emptyTilledTile = yield Movement_1.findAndMoveToFaceTarget((point, tile) => {
                    const tileContainer = tile;
                    return tile.doodad === undefined &&
                        TileHelpers_1.default.isOpenTile(point, tile) &&
                        TileHelpers_1.default.getType(tile) === Enums_1.TerrainType.Dirt &&
                        TileHelpers_1.default.isTilled(tile) &&
                        tile.corpses === undefined &&
                        (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
                }, ITars_1.gardenMaxTilesChecked, Base_1.getBasePosition(base));
                if (emptyTilledTile === Movement_1.MoveResult.NoTarget) {
                    const nearbyDirtTile = yield Movement_1.findAndMoveToFaceTarget((point, tile) => TileHelpers_1.default.getType(tile) === Enums_1.TerrainType.Dirt && Base_1.isOpenArea(point, tile), ITars_1.gardenMaxTilesChecked, Base_1.getBasePosition(base));
                    if (nearbyDirtTile === Movement_1.MoveResult.NoTarget) {
                        this.log.info("No nearby dirt tile");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (nearbyDirtTile !== Movement_1.MoveResult.Complete) {
                        return;
                    }
                    this.log.info("Till a tile");
                    return new UseItem_1.default(inventory.hoe, Enums_1.ActionType.Till);
                }
                else if (emptyTilledTile === Movement_1.MoveResult.Complete) {
                    this.log.info(`Plant ${game.getName(this.seed, Enums_1.SentenceCaseStyle.Title, false)}`);
                    return new UseItem_1.default(this.seed, Enums_1.ActionType.Plant);
                }
            });
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBYUEsZUFBK0IsU0FBUSxtQkFBUztRQUUvQyxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGFBQWEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQy9FLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsSUFBSSxTQUFTLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFDckMsT0FBTyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUM7Z0JBRUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxrQ0FBdUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRTtvQkFDdEYsTUFBTSxhQUFhLEdBQUcsSUFBc0IsQ0FBQztvQkFDN0MsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQy9CLHFCQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7d0JBQ25DLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSTt3QkFDOUMscUJBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO3dCQUMxQixJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVM7d0JBQzFCLENBQUMsYUFBYSxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksYUFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLENBQUMsRUFBRSw2QkFBcUIsRUFBRSxzQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELElBQUksZUFBZSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUM1QyxNQUFNLGNBQWMsR0FBRyxNQUFNLGtDQUF1QixDQUFDLENBQUMsS0FBZSxFQUFFLElBQVcsRUFBRSxFQUFFLENBQ3JGLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFXLENBQUMsSUFBSSxJQUFJLGlCQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLDZCQUFxQixFQUFFLHNCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDMUgsSUFBSSxjQUFjLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ2hDO29CQUVELElBQUksY0FBYyxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUMzQyxPQUFPO3FCQUNQO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUM3QixPQUFPLElBQUksaUJBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBRW5EO3FCQUFNLElBQUksZUFBZSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx5QkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsRixPQUFPLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGtCQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2hEO1lBQ0YsQ0FBQztTQUFBO0tBRUQ7SUE5Q0QsNEJBOENDIn0=
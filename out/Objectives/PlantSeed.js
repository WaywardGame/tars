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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBYUEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sYUFBYSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDL0UsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFNBQVMsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUNyQyxPQUFPLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMxQztnQkFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLGtDQUF1QixDQUFDLENBQUMsS0FBZSxFQUFFLElBQVcsRUFBRSxFQUFFO29CQUN0RixNQUFNLGFBQWEsR0FBRyxJQUFzQixDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDL0IscUJBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzt3QkFDbkMscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJO3dCQUM5QyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUzt3QkFDMUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUYsQ0FBQyxFQUFFLDZCQUFxQixFQUFFLHNCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakQsSUFBSSxlQUFlLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQzVDLE1BQU0sY0FBYyxHQUFHLE1BQU0sa0NBQXVCLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUUsQ0FDckYscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLElBQUksaUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsNkJBQXFCLEVBQUUsc0JBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxSCxJQUFJLGNBQWMsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzt3QkFDckMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztxQkFDaEM7b0JBRUQsSUFBSSxjQUFjLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQzNDLE9BQU87cUJBQ1A7b0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzdCLE9BQU8sSUFBSSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFFbkQ7cUJBQU0sSUFBSSxlQUFlLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xGLE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEQ7WUFDRixDQUFDO1NBQUE7S0FFRDtJQTlDRCw0QkE4Q0MifQ==
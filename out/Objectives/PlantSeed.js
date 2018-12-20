var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "utilities/TileHelpers", "../IObjective", "../ITars", "../Objective", "../Utilities/Base", "../Utilities/Movement", "./AcquireItem", "./UseItem"], function (require, exports, IAction_1, Enums_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, Base_1, Movement_1, AcquireItem_1, UseItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBY0EsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLElBQVc7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUM1RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELElBQUksU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzFDO2dCQUVELE1BQU0sZUFBZSxHQUFHLE1BQU0sa0NBQXVCLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUU7b0JBQ3RGLE1BQU0sYUFBYSxHQUFHLElBQXNCLENBQUM7b0JBQzdDLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTO3dCQUMvQixxQkFBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO3dCQUNuQyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUk7d0JBQzlDLHFCQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTO3dCQUMxQixDQUFDLGFBQWEsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM1RixDQUFDLEVBQUUsNkJBQXFCLEVBQUUsc0JBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLGVBQWUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDNUMsTUFBTSxjQUFjLEdBQUcsTUFBTSxrQ0FBdUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRSxDQUNyRixxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUksSUFBSSxpQkFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSw2QkFBcUIsRUFBRSxzQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzFILElBQUksY0FBYyxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3dCQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3FCQUNoQztvQkFFRCxJQUFJLGNBQWMsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDM0MsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUVuRDtxQkFBTSxJQUFJLGVBQWUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQy9ELE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEQ7WUFDRixDQUFDO1NBQUE7S0FFRDtJQTlDRCw0QkE4Q0MifQ==
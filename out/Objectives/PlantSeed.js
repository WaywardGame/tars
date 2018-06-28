var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/TileHelpers", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./UseItem"], function (require, exports, Enums_1, TileHelpers_1, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeed extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (inventory.hoe === undefined) {
                    this.log.info("Acquire a stone hoe");
                    return new AcquireItem_1.default(Enums_1.ItemType.StoneHoe);
                }
                const emptyTilledTile = yield Helpers.findAndMoveToTarget((point, tile) => {
                    const tileContainer = tile;
                    return tile.doodad === undefined &&
                        TileHelpers_1.default.isOpenTile(point, tile) &&
                        TileHelpers_1.default.getType(tile) === Enums_1.TerrainType.Dirt &&
                        TileHelpers_1.default.isTilled(tile) &&
                        tile.corpses === undefined &&
                        (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
                }, false, ITars_1.gardenMaxTilesChecked, Helpers.getBasePosition(base));
                if (emptyTilledTile === ITars_1.MoveResult.NoTarget) {
                    const nearbyDirtTile = yield Helpers.findAndMoveToTarget((point, tile) => TileHelpers_1.default.getType(tile) === Enums_1.TerrainType.Dirt && Helpers.isOpenArea(base, point, tile), false, ITars_1.gardenMaxTilesChecked, Helpers.getBasePosition(base));
                    if (nearbyDirtTile === ITars_1.MoveResult.NoTarget) {
                        this.log.info("No nearby dirt tile");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (nearbyDirtTile !== ITars_1.MoveResult.Complete) {
                        return;
                    }
                    this.log.info("Till a tile");
                    return new UseItem_1.default(inventory.hoe, Enums_1.ActionType.Till);
                }
                else if (emptyTilledTile === ITars_1.MoveResult.Complete) {
                    this.log.info(`Plant ${Enums_1.ItemType[this.seed.type]}`);
                    return new UseItem_1.default(this.seed, Enums_1.ActionType.Plant);
                }
            });
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBWUEsZUFBK0IsU0FBUSxtQkFBUztRQUUvQyxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELElBQUksU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzFDO2dCQUVELE1BQU0sZUFBZSxHQUFHLE1BQU0sT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBZSxFQUFFLElBQVcsRUFBRSxFQUFFO29CQUMxRixNQUFNLGFBQWEsR0FBRyxJQUFzQixDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDL0IscUJBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzt3QkFDbkMscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJO3dCQUM5QyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUzt3QkFDMUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUYsQ0FBQyxFQUFFLEtBQUssRUFBRSw2QkFBcUIsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksZUFBZSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO29CQUM1QyxNQUFNLGNBQWMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRSxDQUN6RixxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxtQkFBVyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLDZCQUFxQixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdkosSUFBSSxjQUFjLEtBQUssa0JBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ2hDO29CQUVELElBQUksY0FBYyxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUMzQyxPQUFPO3FCQUNQO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUM3QixPQUFPLElBQUksaUJBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBRW5EO3FCQUFNLElBQUksZUFBZSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO29CQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLGdCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ25ELE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEQ7WUFDRixDQUFDO1NBQUE7S0FFRDtJQTFDRCw0QkEwQ0MifQ==
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "tile/Terrains", "utilities/TileHelpers", "../Helpers", "../ITars", "../Navigation", "../Objective", "./UseItem"], function (require, exports, Enums_1, Terrains_1, TileHelpers_1, Helpers, ITars_1, Navigation_1, Objective_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWater extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                const facingTile = localPlayer.getFacingTile();
                let tileType = TileHelpers_1.default.getType(facingTile);
                let terrainDescription = Terrains_1.default[tileType];
                let target;
                if (!terrainDescription || !(terrainDescription.water || terrainDescription.shallowWater)) {
                    target = TileHelpers_1.default.findMatchingTile(localPlayer, (point, tile) => {
                        tileType = TileHelpers_1.default.getType(tile);
                        terrainDescription = Terrains_1.default[tileType];
                        return terrainDescription && (terrainDescription.water || terrainDescription.shallowWater) ? true : false;
                    }, ITars_1.defaultMaxTilesChecked);
                    if (!target) {
                        const targets = yield Helpers.getNearestTileLocation(Navigation_1.anyWaterTileLocation, localPlayer);
                        if (targets.length === 0) {
                            this.log.info("No nearby water, go near some");
                            return;
                        }
                        target = targets[0].point;
                    }
                }
                this.log.info("Gather water");
                return new UseItem_1.default(this.item, Enums_1.ActionType.GatherWater, target);
            });
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWFBLGlCQUFpQyxTQUFRLG1CQUFTO1FBRWpELFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFWSxTQUFTOztnQkFDckIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLE1BQTRCLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUMxRixNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUU7d0JBQ25GLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDckMsa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDeEMsT0FBTyxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzNHLENBQUMsRUFBRSw4QkFBc0IsQ0FBQyxDQUFDO29CQUUzQixJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLHNCQUFzQixDQUFDLGlDQUFvQixFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUN4RixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDOzRCQUMvQyxPQUFPO3lCQUNQO3dCQUVELE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUMxQjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxrQkFBVSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxDQUFDO1NBQUE7S0FFRDtJQWxDRCw4QkFrQ0MifQ==
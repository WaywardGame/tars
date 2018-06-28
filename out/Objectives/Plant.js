define(["require", "exports", "Enums", "Utilities", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItem", "./UseItem"], function (require, exports, Enums_1, Utilities, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Plant extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
        }
        onExecute(base, inventory) {
            if (inventory.hoe === undefined) {
                this.log("Acquire a stone hoe");
                return new AcquireItem_1.default(Enums_1.ItemType.StoneHoe);
            }
            const emptyTilledTile = Helpers.findAndMoveToTarget((point, tile) => tile.doodad === undefined && Utilities.TileHelpers.isTilled(tile), false, ITars_1.gardenMaxTilesChecked);
            if (emptyTilledTile === ITars_1.MoveResult.NoTarget) {
                const nearbyDirtTile = Helpers.findAndMoveToTarget((point, tile) => Utilities.TileHelpers.isOpenTile(point, tile) && Utilities.TileHelpers.getType(tile) === Enums_1.TerrainType.Dirt, false, ITars_1.gardenMaxTilesChecked);
                if (nearbyDirtTile === ITars_1.MoveResult.NoTarget) {
                    this.log("No nearby dirt tile");
                    return IObjective_1.ObjectiveType.None;
                }
                this.log("Till a tile");
                return new UseItem_1.default(inventory.hoe, Enums_1.ActionType.Till);
            }
            else if (emptyTilledTile === ITars_1.MoveResult.Complete) {
                this.log(`Planting ${Enums_1.ItemType[this.seed.type]}`);
                return new UseItem_1.default(this.seed, Enums_1.ActionType.Plant);
            }
        }
    }
    exports.default = Plant;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9QbGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxXQUEyQixTQUFRLG1CQUFTO1FBRTNDLFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFTSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUVELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQWMsRUFBRSxJQUFXLEtBQUssSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLDZCQUFxQixDQUFDLENBQUM7WUFDdEwsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLGtCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBYyxFQUFFLElBQVcsS0FBSyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLDZCQUFxQixDQUFDLENBQUM7Z0JBQzdOLEVBQUUsQ0FBQyxDQUFDLGNBQWMsS0FBSyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxDQUFDLDBCQUFhLENBQUMsSUFBSSxDQUFDO2dCQUMzQixDQUFDO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxrQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLGtCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLGdCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxrQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pELENBQUM7UUFDRixDQUFDO0tBRUQ7SUE3QkQsd0JBNkJDIn0=
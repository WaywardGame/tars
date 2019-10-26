define(["require", "exports", "doodad/Doodads", "entity/action/IAction", "item/IItem", "utilities/TileHelpers", "../../Context", "../../ITars", "../../Objective", "../../Utilities/Base", "../Acquire/Item/AcquireItem", "../ContextData/CopyContextData", "../ContextData/SetContextData", "../Core/MoveToTarget", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, TileHelpers_1, Context_1, ITars_1, Objective_1, Base_1, AcquireItem_1, CopyContextData_1, SetContextData_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeed extends Objective_1.default {
        constructor(seed) {
            super();
            this.seed = seed;
            const description = this.seed.description();
            if (!description || !description.onUse) {
                throw new Error("Invalid onUse for seed");
            }
            const plantType = description.onUse[IAction_1.ActionType.Plant];
            const plantDescription = Doodads_1.default[plantType];
            if (!plantDescription) {
                throw new Error("Invalid plant description");
            }
            const allowedTiles = plantDescription.allowedTiles;
            if (!allowedTiles) {
                throw new Error("Invalid allowed tiles");
            }
            this.plantTiles = allowedTiles;
        }
        getIdentifier() {
            return `PlantSeed:${this.seed}`;
        }
        async execute(context) {
            const objectives = [];
            if (context.inventory.hoe === undefined) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHoe));
                objectives.push(new CopyContextData_1.default(Context_1.ContextDataType.Item1, Context_1.ContextDataType.LastAcquiredItem));
            }
            else {
                objectives.push(new SetContextData_1.default(Context_1.ContextDataType.Item1, context.inventory.hoe));
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(Base_1.getBasePosition(context), (point, tile) => {
                const tileContainer = tile;
                return tile.doodad === undefined &&
                    tile.corpses === undefined &&
                    TileHelpers_1.default.isOpenTile(point, tile) &&
                    TileHelpers_1.default.isTilled(tile) &&
                    this.plantTiles.indexOf(TileHelpers_1.default.getType(tile)) !== -1 &&
                    (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
            }, ITars_1.gardenMaxTilesChecked);
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true));
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTile(Base_1.getBasePosition(context), (point, tile) => this.plantTiles.indexOf(TileHelpers_1.default.getType(tile)) !== -1 && Base_1.isOpenArea(context, point, tile), ITars_1.gardenMaxTilesChecked);
                if (nearbyTillableTile !== undefined) {
                    objectives.push(new MoveToTarget_1.default(nearbyTillableTile, true));
                    objectives.push(new CopyContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, Context_1.ContextDataType.Item1));
                    objectives.push(new UseItem_1.default(IAction_1.ActionType.Till));
                }
            }
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Plant, this.seed));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW9CQSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFJL0MsWUFBNkIsSUFBVTtZQUN0QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBR3RDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMxQztZQUVELE1BQU0sU0FBUyxHQUFlLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRSxNQUFNLGdCQUFnQixHQUFHLGlCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQzdDO1lBRUQsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1lBQ25ELElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FB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
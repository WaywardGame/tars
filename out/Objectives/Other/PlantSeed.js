define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "utilities/game/TileHelpers", "../../IContext", "../../IObjective", "../../ITars", "../../Objective", "../../utilities/Base", "../acquire/item/AcquireItem", "../contextData/CopyContextData", "../contextData/SetContextData", "../core/MoveToTarget", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, TileHelpers_1, IContext_1, IObjective_1, ITars_1, Objective_1, Base_1, AcquireItem_1, CopyContextData_1, SetContextData_1, MoveToTarget_1, UseItem_1) {
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
                objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, IContext_1.ContextDataType.Item1));
            }
            else {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hoe));
            }
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(Base_1.getBasePosition(context), (point, tile) => {
                const tileContainer = tile;
                return game.isTileEmpty(tile) &&
                    TileHelpers_1.default.isOpenTile(point, tile) &&
                    TileHelpers_1.default.isTilled(tile) &&
                    this.plantTiles.includes(TileHelpers_1.default.getType(tile)) &&
                    (tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
            }, { maxTilesChecked: ITars_1.gardenMaxTilesChecked });
            if (emptyTilledTile !== undefined) {
                objectives.push(new MoveToTarget_1.default(emptyTilledTile, true));
            }
            else {
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTile(Base_1.getBasePosition(context), (point, tile) => this.plantTiles.includes(TileHelpers_1.default.getType(tile)) && Base_1.isOpenArea(context, point, tile), { maxTilesChecked: ITars_1.gardenMaxTilesChecked });
                if (nearbyTillableTile !== undefined) {
                    objectives.push(new MoveToTarget_1.default(nearbyTillableTile, true));
                    objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.Item1, IContext_1.ContextDataType.LastAcquiredItem));
                    objectives.push(new UseItem_1.default(IAction_1.ActionType.Till));
                }
                else {
                    return IObjective_1.ObjectiveResult.Impossible;
                }
            }
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Plant, this.seed));
            return objectives;
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW9CQSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFJL0MsWUFBNkIsSUFBVTtZQUN0QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBR3RDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMxQztZQUVELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RCxNQUFNLGdCQUFnQixHQUFHLGlCQUFrQixDQUFDLFNBQVUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQzdDO1lBRUQsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1lBQ25ELElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FB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
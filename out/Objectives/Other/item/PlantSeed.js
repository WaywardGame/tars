define(["require", "exports", "game/doodad/Doodads", "game/entity/action/IAction", "game/item/IItem", "utilities/game/TileHelpers", "../../../IContext", "../../../IObjective", "../../../ITars", "../../../Objective", "../../../utilities/Base", "../../acquire/item/AcquireItem", "../../contextData/CopyContextData", "../../contextData/SetContextData", "../../core/MoveToTarget", "./UseItem"], function (require, exports, Doodads_1, IAction_1, IItem_1, TileHelpers_1, IContext_1, IObjective_1, ITars_1, Objective_1, Base_1, AcquireItem_1, CopyContextData_1, SetContextData_1, MoveToTarget_1, UseItem_1) {
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
            const emptyTilledTile = TileHelpers_1.default.findMatchingTile(Base_1.baseUtilities.getBasePosition(context), (point, tile) => {
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
                const nearbyTillableTile = TileHelpers_1.default.findMatchingTile(Base_1.baseUtilities.getBasePosition(context), (point, tile) => this.plantTiles.includes(TileHelpers_1.default.getType(tile)) && Base_1.baseUtilities.isOpenArea(context, point, tile), { maxTilesChecked: ITars_1.gardenMaxTilesChecked });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBb0JBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUkvQyxZQUE2QixJQUFVO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU07WUFHdEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQzFDO1lBRUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RELE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWtCLENBQUMsU0FBVSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7YUFDN0M7WUFFRCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7WUFDbkQsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7UUFDaEMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksT0FBTyxDQUFDLFNBQVMs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
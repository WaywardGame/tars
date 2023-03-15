define(["require", "exports", "game/entity/action/actions/Mine", "game/entity/action/actions/Chop", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Restart", "./PickUpAllTileItems", "../../interrupt/ButcherCorpse"], function (require, exports, Mine_1, Chop_1, IObjective_1, Objective_1, ExecuteAction_1, Restart_1, PickUpAllTileItems_1, ButcherCorpse_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ClearTile extends Objective_1.default {
        constructor(target, options) {
            super();
            this.target = target;
            this.options = options;
        }
        getIdentifier() {
            return `ClearTile:${this.target.x},${this.target.y},${this.target.z}`;
        }
        getStatus() {
            return `Clearing tile ${this.target.x},${this.target.y},${this.target.z}`;
        }
        async execute(context) {
            const objectives = [
                new PickUpAllTileItems_1.default(this.target),
            ];
            const tile = this.target;
            if (tile.npc || tile.creature || tile.isPlayerOnTile(false, true)) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tileType = tile.type;
            const terrainDescription = tile.description();
            if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                objectives.push(new ExecuteAction_1.default(Mine_1.default, [context.utilities.item.getBestToolForTerrainGather(context, tileType)]).setStatus("Destroying terrain"), new Restart_1.default());
            }
            if (!this.options?.skipDoodad && tile.doodad && !tile.doodad.canPickUp(context.human)) {
                objectives.push(new ExecuteAction_1.default(Chop_1.default, [context.utilities.item.getBestToolForDoodadGather(context, tile.doodad)]).setStatus("Destroying doodad"), new Restart_1.default());
            }
            if (context.utilities.tile.hasCorpses(tile) && context.inventory.butcher) {
                objectives.push(new ButcherCorpse_1.default(tile.corpses[0]), new Restart_1.default());
            }
            return objectives;
        }
    }
    exports.default = ClearTile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJUaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9DbGVhclRpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBb0JBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUU1QyxZQUE2QixNQUFZLEVBQW1CLE9BQW9DO1lBQzVGLEtBQUssRUFBRSxDQUFDO1lBRGlCLFdBQU0sR0FBTixNQUFNLENBQU07WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBNkI7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxhQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUUsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzlFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFpQjtnQkFDN0IsSUFBSSw0QkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ3RDLENBQUM7WUFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRXpCLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUMvRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUMzQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO2dCQUNqRixVQUFVLENBQUMsSUFBSSxDQUNYLElBQUksdUJBQWEsQ0FBQyxjQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUNoSSxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25GLFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSx1QkFBYSxDQUFDLGNBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNsSSxJQUFJLGlCQUFPLEVBQUUsQ0FDaEIsQ0FBQzthQUNMO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RFLFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSx1QkFBYSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsQ0FBQyxDQUFFLENBQUMsRUFDcEMsSUFBSSxpQkFBTyxFQUFFLENBQ2hCLENBQUM7YUFDTDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FFSjtJQWxERCw0QkFrREMifQ==
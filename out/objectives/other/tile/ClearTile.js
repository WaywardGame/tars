/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/action/actions/Mine", "@wayward/game/game/entity/action/actions/Chop", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Restart", "./PickUpAllTileItems", "../../interrupt/ButcherCorpse"], function (require, exports, Mine_1, Chop_1, IObjective_1, Objective_1, ExecuteAction_1, Restart_1, PickUpAllTileItems_1, ButcherCorpse_1) {
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
            if (tile.npc || tile.creature || tile.isPlayerOnTile()) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tileType = tile.type;
            const terrainDescription = tile.description;
            if (terrainDescription && !terrainDescription.passable && !terrainDescription.water && !tile.isDeepHole) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJUaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9DbGVhclRpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBc0JILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixNQUFZLEVBQW1CLE9BQW9DO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQU07WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBNkI7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFpQjtnQkFDaEMsSUFBSSw0QkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ25DLENBQUM7WUFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRXpCLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO2dCQUN4RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzNCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUM1QyxJQUFJLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6RyxVQUFVLENBQUMsSUFBSSxDQUNkLElBQUksdUJBQWEsQ0FBQyxjQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUNoSSxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN2RixVQUFVLENBQUMsSUFBSSxDQUNkLElBQUksdUJBQWEsQ0FBQyxjQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFDbEksSUFBSSxpQkFBTyxFQUFFLENBQ2IsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxRSxVQUFVLENBQUMsSUFBSSxDQUNkLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLENBQUMsQ0FBRSxDQUFDLEVBQ3BDLElBQUksaUJBQU8sRUFBRSxDQUNiLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBbERELDRCQWtEQyJ9
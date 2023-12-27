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
define(["require", "exports", "@wayward/game/game/item/IItem", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Restart", "../other/item/MoveItemsIntoInventory"], function (require, exports, IItem_1, IObjective_1, Objective_1, Restart_1, MoveItemsIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OrganizeBase extends Objective_1.default {
        constructor(tiles) {
            super();
            this.tiles = tiles;
        }
        getIdentifier() {
            return "OrganizeBase";
        }
        getStatus() {
            return "Organizing base";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            if (this.tiles.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (context.base.chest.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            for (const tile of this.tiles) {
                if (tile.containedItems && tile.containedItems.length > 0) {
                    let weight = context.utilities.player.getWeight(context);
                    const maxWeight = context.utilities.player.getMaxWeight(context);
                    const itemsToMove = [];
                    for (const item of tile.containedItems) {
                        if (item.type === IItem_1.ItemType.Sailboat) {
                            continue;
                        }
                        const itemWeight = item.getTotalWeight();
                        if (weight + itemWeight <= maxWeight) {
                            weight += itemWeight;
                            itemsToMove.push(item);
                        }
                    }
                    if (itemsToMove.length === 0) {
                        continue;
                    }
                    const objectives = [];
                    objectives.push(new MoveItemsIntoInventory_1.default(itemsToMove, tile));
                    objectives.push(new Restart_1.default());
                    objectivePipelines.push(objectives);
                }
            }
            if (objectivePipelines.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return objectivePipelines;
        }
    }
    exports.default = OrganizeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Pcmdhbml6ZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBYUgsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRWxELFlBQTZCLEtBQWE7WUFDekMsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUUxQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7WUFDL0IsQ0FBQztZQUVELElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9CLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN6RCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2pFLE1BQU0sV0FBVyxHQUFXLEVBQUUsQ0FBQztvQkFFL0IsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3hDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUVyQyxTQUFTO3dCQUNWLENBQUM7d0JBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLE1BQU0sR0FBRyxVQUFVLElBQUksU0FBUyxFQUFFLENBQUM7NEJBQ3RDLE1BQU0sSUFBSSxVQUFVLENBQUM7NEJBQ3JCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hCLENBQUM7b0JBQ0YsQ0FBQztvQkFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQzlCLFNBQVM7b0JBQ1YsQ0FBQztvQkFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUdwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQXNCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBSy9ELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQztvQkFFL0Isa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQVVyQyxDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXRGRCwrQkFzRkMifQ==
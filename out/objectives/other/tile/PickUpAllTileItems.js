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
define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../item/MoveItemsIntoInventory"], function (require, exports, IObjective_1, Objective_1, MoveItemsIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PickUpAllTileItems extends Objective_1.default {
        constructor(target) {
            super();
            this.target = target;
        }
        getIdentifier() {
            return `PickUpAllTileItems:${this.target.x},${this.target.y},${this.target.z}`;
        }
        getStatus() {
            return `Picking up all items on ${this.target.x},${this.target.y},${this.target.z}`;
        }
        async execute(context) {
            const targetTile = this.target;
            if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new MoveItemsIntoInventory_1.default(targetTile.containedItems);
        }
    }
    exports.default = PickUpAllTileItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlja1VwQWxsVGlsZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9QaWNrVXBBbGxUaWxlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBVUgsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsTUFBWTtZQUN4QyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFNO1FBRXpDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDaEYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDJCQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDL0IsSUFBSSxVQUFVLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkYsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsT0FBTyxJQUFJLGdDQUFzQixDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM5RCxDQUFDO0tBRUQ7SUF2QkQscUNBdUJDIn0=
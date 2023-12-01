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
define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "./MoveItem"], function (require, exports, IObjective_1, Objective_1, MoveToTarget_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItemIntoInventory extends Objective_1.default {
        constructor(item, tile, targetContainer) {
            super();
            this.item = item;
            this.tile = tile;
            this.targetContainer = targetContainer;
        }
        getIdentifier() {
            return `MoveItemIntoInventory:${this.item}`;
        }
        getStatus() {
            return `Moving ${this.item?.getName()} into inventory`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid) {
                this.log.warn(`Unable to move item "${item}" into the inventory`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (context.island.items.isContainableInContainer(item, context.human.inventory)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const tile = this.tile ?? item.tile;
            if (!tile) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(tile, true, { skipIfAlreadyThere: true }).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
                new MoveItem_1.default(item, this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, item), tile),
            ];
        }
    }
    exports.default = MoveItemIntoInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1JbnRvSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbUludG9JbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBYUgsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFM0QsWUFBNkIsSUFBVyxFQUFtQixJQUFXLEVBQW1CLGVBQTRCO1lBQ3BILEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBTztZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUVySCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHlCQUF5QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFVBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUM7UUFDeEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLHNCQUFzQixDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDbEYsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFFRCxPQUFPO2dCQUVOLElBQUksc0JBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzVILElBQUksa0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDO2FBQ3BILENBQUM7UUFDSCxDQUFDO0tBRUQ7SUFyQ0Qsd0NBcUNDIn0=
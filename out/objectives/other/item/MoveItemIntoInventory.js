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
            if (!item?.isValid()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1JbnRvSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbUludG9JbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsSUFBVyxFQUFtQixJQUFXLEVBQW1CLGVBQTRCO1lBQ2pILEtBQUssRUFBRSxDQUFDO1lBRGlCLFNBQUksR0FBSixJQUFJLENBQU87WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBTztZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUVySCxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLHlCQUF5QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFVBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUM7UUFDM0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLHNCQUFzQixDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDbEM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM5RSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1AsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE9BQU87Z0JBRUgsSUFBSSxzQkFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDNUgsSUFBSSxrQkFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDdkgsQ0FBQztRQUNOLENBQUM7S0FFSjtJQXJDRCx3Q0FxQ0MifQ==
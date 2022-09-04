define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "./MoveItem"], function (require, exports, IObjective_1, Objective_1, MoveToTarget_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItemIntoInventory extends Objective_1.default {
        constructor(item, point) {
            super();
            this.item = item;
            this.point = point;
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
            const point = this.point ?? item.getPoint();
            if (!point) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(point, true, { skipIfAlreadyThere: true }).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
                new MoveItem_1.default(item, context.utilities.item.getMoveItemToInventoryTarget(context, item), point),
            ];
        }
    }
    exports.default = MoveItemIntoInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1JbnRvSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbUludG9JbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsSUFBVyxFQUFtQixLQUFnQjtZQUN2RSxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQVc7UUFFM0UsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDO1FBQzNELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNsRSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDOUUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE9BQU87Z0JBRUgsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDN0gsSUFBSSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDO2FBQ2hHLENBQUM7UUFDTixDQUFDO0tBRUo7SUFyQ0Qsd0NBcUNDIn0=
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
define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "./MoveItems"], function (require, exports, IObjective_1, Objective_1, MoveToTarget_1, MoveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItemsIntoInventory extends Objective_1.default {
        constructor(itemOrItems, tile, targetContainer) {
            super();
            this.tile = tile;
            this.targetContainer = targetContainer;
            this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
        }
        getIdentifier() {
            return `MoveItemsIntoInventory:${this.items?.join(",")}`;
        }
        getStatus() {
            return `Moving ${this.items?.join(",")} into inventory`;
        }
        async execute(context) {
            const items = this.items ?? [this.getAcquiredItem(context)];
            if (items.some(item => !item?.isValid)) {
                this.log.warn(`Unable to move item "${items}" into the inventory`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (items.every(item => context.island.items.isContainableInContainer(item, context.human.inventory))) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const tile = this.tile ?? items[0].tile;
            if (!tile) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(tile, true).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
                new MoveItems_1.default(items, this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, items[0]), tile),
            ];
        }
    }
    exports.default = MoveItemsIntoInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1zSW50b0ludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vTW92ZUl0ZW1zSW50b0ludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQkgsTUFBcUIsc0JBQXVCLFNBQVEsbUJBQVM7UUFJNUQsWUFBWSxXQUFzQyxFQUFtQixJQUFXLEVBQW1CLGVBQTRCO1lBQzlILEtBQUssRUFBRSxDQUFDO1lBRDRELFNBQUksR0FBSixJQUFJLENBQU87WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWE7WUFHOUgsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNuRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDBCQUEwQixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzFELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztRQUN6RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixLQUFLLHNCQUFzQixDQUFDLENBQUM7Z0JBQ25FLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQVksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDL0csT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSyxLQUFLLENBQUMsQ0FBQyxDQUFVLENBQUMsSUFBSSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFFRCxPQUFPO2dCQUVOLElBQUksc0JBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM5RixJQUFJLG1CQUFTLENBQUMsS0FBZSxFQUFFLElBQUksQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQzthQUM1SSxDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBekNELHlDQXlDQyJ9
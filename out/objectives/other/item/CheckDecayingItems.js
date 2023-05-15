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
define(["require", "exports", "game/item/IItem", "game/item/ItemDescriptions", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemWithRecipe"], function (require, exports, IItem_1, ItemDescriptions_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CheckDecayingItems extends Objective_1.default {
        getIdentifier() {
            return "CheckDecayingItems";
        }
        getStatus() {
            return "Checking for decaying items in base chests";
        }
        async execute(context) {
            const baseItemsWithDecay = context.utilities.item.getBaseItems(context)
                .filter(item => item.decay !== undefined);
            const animalFatItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.AnimalFat && item.decay <= 500)
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
            if (animalFatItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.Tallow, ItemDescriptions_1.itemDescriptions[IItem_1.ItemType.Tallow].recipe);
            }
            const offalItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.Offal && item.decay <= 200)
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
            if (offalItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.AnimalGlue, ItemDescriptions_1.itemDescriptions[IItem_1.ItemType.AnimalGlue].recipe);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckDecayingItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tEZWNheWluZ0l0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9DaGVja0RlY2F5aW5nSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBY0gsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNoQixPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyw0Q0FBNEMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUVqQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUE7WUFFN0MsTUFBTSwwQkFBMEIsR0FBRyxrQkFBa0I7aUJBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQU0sSUFBSSxHQUFHLENBQUM7aUJBQ3RFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLDBCQUEwQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSwrQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sRUFBRSxtQ0FBZ0IsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2FBQ2hHO1lBRUQsTUFBTSxzQkFBc0IsR0FBRyxrQkFBa0I7aUJBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQU0sSUFBSSxHQUFHLENBQUM7aUJBQ2xFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSwrQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsRUFBRSxtQ0FBZ0IsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2FBQ3hHO1lBRUQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxDQUFDO0tBRUo7SUFoQ0QscUNBZ0NDIn0=
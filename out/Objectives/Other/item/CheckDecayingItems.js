define(["require", "exports", "game/item/IItem", "game/item/Items", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemWithRecipe"], function (require, exports, IItem_1, Items_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1) {
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
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.Tallow, Items_1.default[IItem_1.ItemType.Tallow].recipe);
            }
            const offalItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.Offal && item.decay <= 200)
                .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
            if (offalItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.AnimalGlue, Items_1.default[IItem_1.ItemType.AnimalGlue].recipe);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckDecayingItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tEZWNheWluZ0l0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9DaGVja0RlY2F5aW5nSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNoQixPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyw0Q0FBNEMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUVqQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUE7WUFFN0MsTUFBTSwwQkFBMEIsR0FBRyxrQkFBa0I7aUJBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQU0sSUFBSSxHQUFHLENBQUM7aUJBQ3RFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLDBCQUEwQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSwrQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sRUFBRSxlQUFnQixDQUFDLGdCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTyxDQUFDLENBQUM7YUFDaEc7WUFFRCxNQUFNLHNCQUFzQixHQUFHLGtCQUFrQjtpQkFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBTSxJQUFJLEdBQUcsQ0FBQztpQkFDbEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQy9ELElBQUksc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLCtCQUFxQixDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLGVBQWdCLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFPLENBQUMsQ0FBQzthQUN4RztZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDbEMsQ0FBQztLQUVKO0lBaENELHFDQWdDQyJ9
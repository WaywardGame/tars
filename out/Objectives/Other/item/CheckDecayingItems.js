define(["require", "exports", "game/item/IItem", "game/item/Items", "../../../IObjective", "../../../Objective", "../../acquire/item/AcquireItemWithRecipe"], function (require, exports, IItem_1, Items_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1) {
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
            const animalFatItems = context.base.chest
                .map(chest => itemManager.getItemsInContainer(chest, true)
                .filter(item => item.type === IItem_1.ItemType.AnimalFat && item.decay !== undefined && item.decay <= 500))
                .flat()
                .concat(itemManager.getItemsInContainerByType(context.player.inventory, IItem_1.ItemType.AnimalFat, true))
                .sort((a, b) => { var _a, _b; return ((_a = a.decay) !== null && _a !== void 0 ? _a : 999999) - ((_b = b.decay) !== null && _b !== void 0 ? _b : 999999); });
            if (animalFatItems.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.Tallow, Items_1.default[IItem_1.ItemType.Tallow].recipe);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckDecayingItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tEZWNheWluZ0l0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9DaGVja0RlY2F5aW5nSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNoQixPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyw0Q0FBNEMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7aUJBQ3BDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO2lCQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7aUJBQ3RHLElBQUksRUFBRTtpQkFFTixNQUFNLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNqRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBQyxPQUFBLENBQUMsTUFBQSxDQUFDLENBQUMsS0FBSyxtQ0FBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQUEsQ0FBQyxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7WUFDL0QsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxJQUFJLCtCQUFxQixDQUFDLGdCQUFRLENBQUMsTUFBTSxFQUFFLGVBQWdCLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFPLENBQUMsQ0FBQzthQUNoRztZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDbEMsQ0FBQztLQUVKO0lBekJELHFDQXlCQyJ9
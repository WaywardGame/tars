define(["require", "exports", "game/item/IItem", "game/item/Items", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../../utilities/Item", "../../acquire/item/AcquireItemWithRecipe"], function (require, exports, IItem_1, Items_1, IObjective_1, Objective_1, Item_1, AcquireItemWithRecipe_1) {
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
            const baseItemsWithDecay = Item_1.itemUtilities.getBaseItems(context)
                .filter(item => item.decay !== undefined);
            const animalFatItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.AnimalFat && item.decay <= 500)
                .sort((a, b) => { var _a, _b; return ((_a = a.decay) !== null && _a !== void 0 ? _a : 999999) - ((_b = b.decay) !== null && _b !== void 0 ? _b : 999999); });
            if (animalFatItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.Tallow, Items_1.default[IItem_1.ItemType.Tallow].recipe);
            }
            const offalItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.Offal && item.decay <= 200)
                .sort((a, b) => { var _a, _b; return ((_a = a.decay) !== null && _a !== void 0 ? _a : 999999) - ((_b = b.decay) !== null && _b !== void 0 ? _b : 999999); });
            if (offalItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.AnimalGlue, Items_1.default[IItem_1.ItemType.AnimalGlue].recipe);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckDecayingItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tEZWNheWluZ0l0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9DaGVja0RlY2F5aW5nSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNoQixPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyw0Q0FBNEMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUVqQyxNQUFNLGtCQUFrQixHQUFHLG9CQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztpQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQTtZQUU3QyxNQUFNLDBCQUEwQixHQUFHLGtCQUFrQjtpQkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBTSxJQUFJLEdBQUcsQ0FBQztpQkFDdEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLGVBQUMsT0FBQSxDQUFDLE1BQUEsQ0FBQyxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFBLENBQUMsQ0FBQyxLQUFLLG1DQUFJLE1BQU0sQ0FBQyxDQUFBLEVBQUEsQ0FBQyxDQUFDO1lBQy9ELElBQUksMEJBQTBCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkMsT0FBTyxJQUFJLCtCQUFxQixDQUFDLGdCQUFRLENBQUMsTUFBTSxFQUFFLGVBQWdCLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFPLENBQUMsQ0FBQzthQUNoRztZQUVELE1BQU0sc0JBQXNCLEdBQUcsa0JBQWtCO2lCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFNLElBQUksR0FBRyxDQUFDO2lCQUNsRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBQyxPQUFBLENBQUMsTUFBQSxDQUFDLENBQUMsS0FBSyxtQ0FBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQUEsQ0FBQyxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7WUFDL0QsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLElBQUksK0JBQXFCLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLEVBQUUsZUFBZ0IsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2FBQ3hHO1lBRUQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxDQUFDO0tBRUo7SUFoQ0QscUNBZ0NDIn0=
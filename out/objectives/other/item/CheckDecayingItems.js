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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemWithRecipe"], function (require, exports, IItem_1, ItemDescriptions_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1) {
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
                .filter(item => item.getDecayTime() !== undefined);
            const animalFatItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.AnimalFat && item.getDecayTime() <= 500)
                .sort((a, b) => a.getDecayTime() - b.getDecayTime());
            if (animalFatItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.Tallow, ItemDescriptions_1.itemDescriptions[IItem_1.ItemType.Tallow].recipe);
            }
            const offalItemsDecayingSoon = baseItemsWithDecay
                .filter(item => item.type === IItem_1.ItemType.Offal && item.getDecayTime() <= 200)
                .sort((a, b) => a.getDecayTime() - b.getDecayTime());
            if (offalItemsDecayingSoon.length > 0) {
                return new AcquireItemWithRecipe_1.default(IItem_1.ItemType.BoneGlue, ItemDescriptions_1.itemDescriptions[IItem_1.ItemType.BoneGlue].recipe);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckDecayingItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tEZWNheWluZ0l0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9DaGVja0RlY2F5aW5nSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBY0gsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFakQsYUFBYTtZQUNuQixPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw0Q0FBNEMsQ0FBQztRQUNyRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUVwQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQ3JFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxTQUFTLENBQUMsQ0FBQTtZQUVuRCxNQUFNLDBCQUEwQixHQUFHLGtCQUFrQjtpQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFHLElBQUksR0FBRyxDQUFDO2lCQUMvRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFHLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRyxDQUFDLENBQUM7WUFDeEQsSUFBSSwwQkFBMEIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzNDLE9BQU8sSUFBSSwrQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sRUFBRSxtQ0FBZ0IsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO1lBQzlGLENBQUM7WUFFRCxNQUFNLHNCQUFzQixHQUFHLGtCQUFrQjtpQkFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFHLElBQUksR0FBRyxDQUFDO2lCQUMzRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFHLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRyxDQUFDLENBQUM7WUFDeEQsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLE9BQU8sSUFBSSwrQkFBcUIsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsRUFBRSxtQ0FBZ0IsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO1lBQ2xHLENBQUM7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7S0FFRDtJQWhDRCxxQ0FnQ0MifQ==
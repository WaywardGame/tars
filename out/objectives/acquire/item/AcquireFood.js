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
define(["require", "exports", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/game/entity/action/actions/Eat", "../../../core/objective/Objective", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe", "../../core/AddDifficulty", "../../other/item/MoveItemsIntoInventory"], function (require, exports, IAction_1, IItem_1, ItemDescriptions_1, Eat_1, Objective_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1, AddDifficulty_1, MoveItemsIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireFood extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return `AcquireFood:${this.options?.onlyAllowBaseItems}:${this.options?.allowDangerousFoodItems}`;
        }
        getStatus() {
            return "Acquiring food";
        }
        async execute(context) {
            const objectivePipelines = [];
            objectivePipelines.push(...AcquireFood.getFoodRecipeObjectivePipelines(context, false));
            if (this.options?.onlyAllowBaseItems) {
                for (const item of context.utilities.item.getBaseItems(context)) {
                    if (!context.island.items.isContainableInContainer(item, context.human.inventory)) {
                        if (context.utilities.item.foodItemTypes.has(item.type)) {
                            objectivePipelines.push([
                                new MoveItemsIntoInventory_1.default(item).passAcquireData(this),
                            ]);
                        }
                    }
                }
            }
            else {
                for (const itemType of context.utilities.item.foodItemTypes) {
                    const objectivePipeline = [];
                    const isUndesirable = itemType === IItem_1.ItemType.Pemmican;
                    if (isUndesirable) {
                        objectivePipeline.push(new AddDifficulty_1.default(500));
                    }
                    objectivePipeline.push(new AcquireItem_1.default(itemType).passAcquireData(this));
                    objectivePipelines.push(objectivePipeline);
                }
            }
            if (this.options?.allowDangerousFoodItems) {
                objectivePipelines.push([
                    new AddDifficulty_1.default(100),
                    new AcquireItemForAction_1.default(IAction_1.ActionType.Eat).passAcquireData(this),
                ]);
            }
            return objectivePipelines;
        }
        static getFoodRecipeObjectivePipelines(context, eatFood) {
            const objectivePipelines = [];
            for (const itemType of context.utilities.item.foodItemTypes) {
                if (itemType === IItem_1.ItemType.Pemmican) {
                    continue;
                }
                const description = ItemDescriptions_1.itemDescriptions[itemType];
                if (!description || description.craftable === false) {
                    continue;
                }
                const recipe = description.recipe;
                if (!recipe) {
                    continue;
                }
                const checker = context.utilities.item.processRecipe(context, recipe, true);
                for (const chest of context.base.chest) {
                    checker.processContainer(chest);
                }
                if (checker.requirementsMet()) {
                    const objectivePipeline = [];
                    if (eatFood) {
                        objectivePipeline.push(new AcquireItemWithRecipe_1.default(itemType, recipe).keepInInventory(), new UseItem_1.default(Eat_1.default));
                    }
                    else {
                        objectivePipeline.push(new AcquireItemWithRecipe_1.default(itemType, recipe));
                    }
                    objectivePipelines.push(objectivePipeline);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = AcquireFood;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBdUJILE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixPQUFzQztZQUNsRSxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVuRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDbkcsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7Z0JBRXRDLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUNuRixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFF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
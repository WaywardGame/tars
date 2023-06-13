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
define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/ItemDescriptions", "game/entity/action/actions/Eat", "../../../core/objective/Objective", "../../other/item/UseItem", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemWithRecipe", "../../core/AddDifficulty", "../../other/item/MoveItemIntoInventory"], function (require, exports, IAction_1, IItem_1, ItemDescriptions_1, Eat_1, Objective_1, UseItem_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemWithRecipe_1, AddDifficulty_1, MoveItemIntoInventory_1) {
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
                                new MoveItemIntoInventory_1.default(item).passAcquireData(this),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUZvb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUZvb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBdUJILE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixPQUFzQztZQUNsRSxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUVuRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDbkcsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFO2dCQUVyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUNsRixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUN4RCxrQkFBa0Is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
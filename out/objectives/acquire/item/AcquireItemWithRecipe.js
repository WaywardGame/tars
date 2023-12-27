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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Craft", "@wayward/game/game/item/IItem", "@wayward/game/game/item/IItemManager", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "@wayward/game/language/dictionary/Message", "../../../core/ITars", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../utilities/ItemUtilities", "../../contextData/SetContextData", "../../core/AddDifficulty", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../other/item/MoveItemsIntoInventory", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Craft_1, IItem_1, IItemManager_1, Dictionary_1, Translation_1, Message_1, ITars_1, IContext_1, IObjective_1, ItemUtilities_1, SetContextData_1, AddDifficulty_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, MoveItemsIntoInventory_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const expectedCraftMessages = new Set([Message_1.default.ActionCraftYouLackTheRequirements]);
    class AcquireItemWithRecipe extends AcquireBase_1.default {
        constructor(itemType, recipe, allowInventoryItems) {
            super();
            this.itemType = itemType;
            this.recipe = recipe;
            this.allowInventoryItems = allowInventoryItems;
            this.recipeRequiresBaseDoodads = this.recipe.requiresFire === true || this.recipe.requiredDoodads !== undefined;
        }
        getIdentifier() {
            return `AcquireItemWithRecipe:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} with a recipe`;
        }
        canIncludeContextHashCode() {
            return ItemUtilities_1.ItemUtilities.getRelatedItemTypes(this.itemType, ItemUtilities_1.RelatedItemType.Recipe);
        }
        shouldIncludeContextHashCode() {
            return true;
        }
        async execute(context) {
            const requirementInfo = context.island.items.hasAdditionalRequirements(context.human, this.itemType);
            const options = { allowInventoryItems: !!this.allowInventoryItems, allowUnsafeWaterContainers: true };
            const checker = context.utilities.item.processRecipe(context, this.recipe, false, options);
            const checkerWithIntermediateChest = context.utilities.item.processRecipe(context, this.recipe, true, options);
            const availableInventoryWeight = context.utilities.item.getAvailableInventoryWeight(context);
            const estimatedItemWeight = context.island.items.getWeight(this.itemType, IItemManager_1.WeightType.Static);
            const mustUseIntermediateChest = availableInventoryWeight < estimatedItemWeight;
            if (mustUseIntermediateChest) {
                this.log.info(`Must use intermediate chest. Available inventory weight: ${availableInventoryWeight}. Estimated item weight: ${estimatedItemWeight}.`);
                return [
                    this.getObjectives(context, requirementInfo, true, checkerWithIntermediateChest, checker),
                ];
            }
            return [
                this.getObjectives(context, requirementInfo, false, checker),
                this.getObjectives(context, requirementInfo, false, checkerWithIntermediateChest, checker),
            ];
        }
        getObjectives(context, requirementInfo, allowOrganizingItemsIntoIntermediateChest, checker, checkerWithoutIntermediateChest) {
            const objectives = [
                new SetContextData_1.default(IContext_1.ContextDataType.CanCraftFromIntermediateChest, this.recipeRequiresBaseDoodads),
                new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, allowOrganizingItemsIntoIntermediateChest),
                new SetContextData_1.default(IContext_1.ContextDataType.NextActionAllowsIntermediateChest, checkerWithoutIntermediateChest ? true : false),
            ];
            if (this.recipeRequiresBaseDoodads) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.PrioritizeBaseItems, true));
            }
            const requirementsMet = checker.requirementsMet();
            const itemBase = checker.itemBaseComponent;
            if (itemBase) {
                objectives.push(new ReserveItems_1.default(itemBase));
            }
            const requires = this.recipe.components;
            for (let i = 0; i < requires.length; i++) {
                const itemsForComponent = checker.getItemsForComponent(i);
                if (itemsForComponent.length > 0) {
                    const reserveType = requires[i].consumedAmount === 0 ? ITars_1.ReserveType.Soft : ITars_1.ReserveType.Hard;
                    objectives.push(new ReserveItems_1.default(...itemsForComponent).setReserveType(reserveType));
                }
            }
            if (!requirementsMet) {
                if (this.recipe.baseComponent !== undefined && !itemBase) {
                    this.log.info(`Missing base component ${context.island.items.isGroup(this.recipe.baseComponent) ? IItem_1.ItemTypeGroup[this.recipe.baseComponent] : IItem_1.ItemType[this.recipe.baseComponent]}`);
                    if (context.island.items.isGroup(this.recipe.baseComponent)) {
                        objectives.push(new AcquireItemByGroup_1.default(this.recipe.baseComponent).passAcquireData(this, ITars_1.ReserveType.Hard));
                    }
                    else {
                        objectives.push(new AcquireItem_1.default(this.recipe.baseComponent).passAcquireData(this, ITars_1.ReserveType.Hard));
                    }
                }
                const requires = this.recipe.components;
                for (let i = 0; i < requires.length; i++) {
                    const missingAmount = checker.amountNeededForComponent(i);
                    if (missingAmount > 0) {
                        const recipeComponent = requires[i];
                        const componentType = recipeComponent.type;
                        const reserveType = recipeComponent.consumedAmount === 0 ? ITars_1.ReserveType.Soft : ITars_1.ReserveType.Hard;
                        this.log.info(`Missing component ${context.island.items.isGroup(componentType) ? IItem_1.ItemTypeGroup[componentType] : IItem_1.ItemType[componentType]} x${missingAmount}`);
                        for (let j = 0; j < missingAmount; j++) {
                            if (context.island.items.isGroup(componentType)) {
                                objectives.push(new AcquireItemByGroup_1.default(componentType).passAcquireData(this, reserveType));
                            }
                            else {
                                objectives.push(new AcquireItem_1.default(componentType).passAcquireData(this, reserveType));
                            }
                        }
                    }
                }
            }
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));
            if (checkerWithoutIntermediateChest) {
                const intermediateChest = context.base.intermediateChest[0];
                if (intermediateChest && !checkerWithoutIntermediateChest.requirementsMet()) {
                    objectives.push(new MoveToTarget_1.default(intermediateChest, true));
                    if (this.recipeRequiresBaseDoodads) {
                        const moveIfInIntermediateChest = (item) => {
                            if (item) {
                                if (context.island.items.isContainableInContainer(item, intermediateChest)) {
                                    objectives.push(new MoveItemsIntoInventory_1.default(item, intermediateChest.tile));
                                }
                            }
                        };
                        moveIfInIntermediateChest(checker.itemBaseComponent);
                        for (const item of checker.itemComponentsConsumed) {
                            moveIfInIntermediateChest(item);
                        }
                        for (const item of checker.itemComponentsRequired) {
                            moveIfInIntermediateChest(item);
                        }
                    }
                }
            }
            if (this.recipe.level !== 0) {
                objectives.push(new AddDifficulty_1.default(this.recipe.level));
            }
            objectives.push(new CompleteRequirements_1.default(requirementInfo), new MoveToLand_1.default(), new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                genericAction: {
                    action: Craft_1.default,
                    args: () => {
                        return [this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent];
                    },
                    expectedMessages: expectedCraftMessages,
                },
                preRetry: () => {
                    const items = [
                        ...checker.itemComponentsRequired,
                        ...checker.itemComponentsConsumed,
                        checker.itemBaseComponent,
                    ];
                    for (const item of items) {
                        if (item && item.isValid) {
                            return IObjective_1.ObjectiveResult.Restart;
                        }
                    }
                }
            })
                .passAcquireData(this)
                .setStatus(() => `Crafting ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`));
            return objectives;
        }
    }
    exports.default = AcquireItemWithRecipe;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQ0gsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBVSxDQUFDLGlCQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0lBRTVGLE1BQXFCLHFCQUFzQixTQUFRLHFCQUFXO1FBSTdELFlBQTZCLFFBQWtCLEVBQW1CLE1BQWUsRUFBbUIsbUJBQTZCO1lBQ2hJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUFtQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVU7WUFHaEksSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUM7UUFDakgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx5QkFBeUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUUzRCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDO1FBQ3BHLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyw2QkFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsK0JBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRWUsNEJBQTRCO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1FB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
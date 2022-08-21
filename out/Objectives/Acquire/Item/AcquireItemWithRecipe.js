define(["require", "exports", "game/item/IItem", "game/item/IItemManager", "language/Dictionary", "language/Translation", "game/entity/action/actions/Craft", "../../../core/context/IContext", "../../../core/ITars", "../../../core/objective/IObjective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../other/item/MoveItem", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup", "../../core/AddDifficulty"], function (require, exports, IItem_1, IItemManager_1, Dictionary_1, Translation_1, Craft_1, IContext_1, ITars_1, IObjective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, MoveItem_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1, AddDifficulty_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemWithRecipe extends AcquireBase_1.default {
        constructor(itemType, recipe, allowInventoryItems) {
            super();
            this.itemType = itemType;
            this.recipe = recipe;
            this.allowInventoryItems = allowInventoryItems;
        }
        getIdentifier() {
            return `AcquireItemWithRecipe:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} with a recipe`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
        }
        shouldIncludeContextHashCode() {
            return true;
        }
        async execute(context) {
            const canCraftFromIntermediateChest = !this.recipe.requiresFire && !this.recipe.requiredDoodads;
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
                    this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, true, checkerWithIntermediateChest, checker),
                ];
            }
            return [
                this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, false, checker),
                this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, false, checkerWithIntermediateChest, checker),
            ];
        }
        getObjectives(context, requirementInfo, canCraftFromIntermediateChest, allowOrganizingItemsIntoIntermediateChest, checker, checkerWithoutIntermediateChest) {
            const objectives = [
                new SetContextData_1.default(IContext_1.ContextDataType.PrioritizeBaseChests, canCraftFromIntermediateChest),
                new SetContextData_1.default(IContext_1.ContextDataType.CanCraftFromIntermediateChest, canCraftFromIntermediateChest),
                new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, allowOrganizingItemsIntoIntermediateChest),
                new SetContextData_1.default(IContext_1.ContextDataType.NextActionAllowsIntermediateChest, checkerWithoutIntermediateChest ? true : false),
            ];
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
                    if (!canCraftFromIntermediateChest) {
                        const moveIfInIntermediateChest = (item) => {
                            if (item) {
                                if (context.island.items.isContainableInContainer(item, intermediateChest)) {
                                    objectives.push(new MoveItem_1.default(item, context.human.inventory, intermediateChest));
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
                    args: [this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent],
                },
                preRetry: () => {
                    const items = [
                        ...checker.itemComponentsRequired,
                        ...checker.itemComponentsConsumed,
                        checker.itemBaseComponent,
                    ];
                    for (const item of items) {
                        if (item && item.isValid()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUEyQkEsTUFBcUIscUJBQXNCLFNBQVEscUJBQVc7UUFFN0QsWUFBNkIsUUFBa0IsRUFBbUIsTUFBZSxFQUFtQixtQkFBNkI7WUFDaEksS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFTO1lBQW1CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBVTtRQUVqSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHlCQUF5QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzNELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEcsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFZSw0QkFBNEI7WUFDM0MsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLDZCQUE2QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUVoRyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FB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
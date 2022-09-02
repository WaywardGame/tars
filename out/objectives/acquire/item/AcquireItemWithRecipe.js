define(["require", "exports", "game/item/IItem", "game/item/IItemManager", "language/Dictionary", "language/Translation", "game/entity/action/actions/Craft", "../../../core/context/IContext", "../../../core/ITars", "../../../core/objective/IObjective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup", "../../core/AddDifficulty", "language/dictionary/Message", "../../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, IItemManager_1, Dictionary_1, Translation_1, Craft_1, IContext_1, ITars_1, IObjective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1, AddDifficulty_1, Message_1, MoveItemIntoInventory_1) {
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
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
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
                                    objectives.push(new MoveItemIntoInventory_1.default(item, intermediateChest));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUE4QkEsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBVSxDQUFDLGlCQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0lBRTVGLE1BQXFCLHFCQUFzQixTQUFRLHFCQUFXO1FBSTdELFlBQTZCLFFBQWtCLEVBQW1CLE1BQWUsRUFBbUIsbUJBQTZCO1lBQ2hJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUFtQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVU7WUFHaEksSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUM7UUFDakgsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx5QkFBeUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUUzRCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDO1FBQ3BHLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxvQkFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRWUsNEJBQTRCO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7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
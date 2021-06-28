define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/IItemManager", "language/Dictionaries", "language/Translation", "../../../IContext", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../other/item/MoveItem", "../../utility/CompleteRequirements", "../../utility/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, IItemManager_1, Dictionaries_1, Translation_1, IContext_1, Item_1, SetContextData_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, MoveItem_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1) {
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
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()} with a recipe`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode() {
            return true;
        }
        async execute(context) {
            const canCraftFromIntermediateChest = !this.recipe.requiresFire && !this.recipe.requiredDoodads;
            const requirementInfo = itemManager.hasAdditionalRequirements(context.player, this.itemType);
            const checker = Item_1.itemUtilities.processRecipe(context, this.recipe, false, this.allowInventoryItems);
            const checkerWithIntermediateChest = Item_1.itemUtilities.processRecipe(context, this.recipe, true, this.allowInventoryItems);
            const availableInventoryWeight = Item_1.itemUtilities.getAvailableInventoryWeight(context);
            const estimatedItemWeight = itemManager.getWeight(this.itemType, IItemManager_1.WeightType.Static);
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
                    objectives.push(new ReserveItems_1.default(...itemsForComponent));
                }
            }
            if (!requirementsMet) {
                if (this.recipe.baseComponent !== undefined && !itemBase) {
                    this.log.info(`Missing base component ${itemManager.isGroup(this.recipe.baseComponent) ? IItem_1.ItemTypeGroup[this.recipe.baseComponent] : IItem_1.ItemType[this.recipe.baseComponent]}`);
                    if (itemManager.isGroup(this.recipe.baseComponent)) {
                        objectives.push(new AcquireItemByGroup_1.default(this.recipe.baseComponent).passContextDataKey(this));
                    }
                    else {
                        objectives.push(new AcquireItem_1.default(this.recipe.baseComponent).passContextDataKey(this));
                    }
                }
                const requires = this.recipe.components;
                for (let i = 0; i < requires.length; i++) {
                    const missingAmount = checker.amountNeededForComponent(i);
                    if (missingAmount > 0) {
                        const componentType = requires[i].type;
                        this.log.info(`Missing component ${itemManager.isGroup(componentType) ? IItem_1.ItemTypeGroup[componentType] : IItem_1.ItemType[componentType]} x${missingAmount}`);
                        for (let j = 0; j < missingAmount; j++) {
                            if (itemManager.isGroup(componentType)) {
                                objectives.push(new AcquireItemByGroup_1.default(componentType).passContextDataKey(this));
                            }
                            else {
                                objectives.push(new AcquireItem_1.default(componentType).passContextDataKey(this));
                            }
                        }
                    }
                }
            }
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));
            if (checkerWithoutIntermediateChest && context.base.intermediateChest[0]) {
                if (!checkerWithoutIntermediateChest.requirementsMet()) {
                    objectives.push(new MoveToTarget_1.default(context.base.intermediateChest[0], true));
                    if (!canCraftFromIntermediateChest) {
                        const moveIfInIntermediateChest = (item) => {
                            if (item) {
                                const intermediateChest = context.base.intermediateChest[0];
                                if (item.containedWithin === intermediateChest) {
                                    objectives.push(new MoveItem_1.default(item, context.player.inventory, intermediateChest));
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
            if (requirementInfo.requirements === IItemManager_1.RequirementStatus.Missing) {
                objectives.push(new CompleteRequirements_1.default(requirementInfo));
            }
            else {
                objectives.push(new MoveToLand_1.default());
            }
            objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], IAction_1.ActionType.Craft, (context, action) => {
                action.execute(context.player, this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent);
            }).passContextDataKey(this).setStatus(() => `Crafting ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()}`));
            return objectives;
        }
    }
    exports.default = AcquireItemWithRecipe;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF3QkEsTUFBcUIscUJBQXNCLFNBQVEscUJBQVc7UUFFN0QsWUFBNkIsUUFBa0IsRUFBbUIsTUFBZSxFQUFtQixtQkFBNkI7WUFDaEksS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFTO1lBQW1CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBVTtRQUVqSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHlCQUF5QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzNELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEcsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEI7WUFFbEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLDZCQUE2QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUVoRyxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0YsTUFBTSxPQUFPLEdBQUcsb0JBQWEsQ0FBQyxhQUFhLENBQUMs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
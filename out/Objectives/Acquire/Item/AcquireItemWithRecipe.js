define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/IItemManager", "language/Dictionaries", "language/Translation", "../../../IContext", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteAction", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/ReserveItems", "../../utility/CompleteRequirements", "../../utility/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, IItemManager_1, Dictionaries_1, Translation_1, IContext_1, Item_1, SetContextData_1, ExecuteAction_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1) {
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
                            if (item && item.containedWithin === context.base.intermediateChest[0]) {
                                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                    action.execute(context.player, item, context.player.inventory);
                                }).setStatus(() => `Moving ${item.getName()} to inventory`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF3QkEsTUFBcUIscUJBQXNCLFNBQVEscUJBQVc7UUFFN0QsWUFBNkIsUUFBa0IsRUFBbUIsTUFBZSxFQUFtQixtQkFBNkI7WUFDaEksS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFTO1lBQW1CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBVTtRQUVqSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHlCQUF5QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzNELENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7WUFFaEcsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTdGLE1BQU0sT0FBTyxHQUFHLG9CQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNuRyxNQUFNLDRCQUE0QixHQUFHLG9CQUFhLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJ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
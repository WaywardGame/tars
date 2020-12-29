define(["require", "exports", "entity/action/IAction", "item/IItem", "item/IItemManager", "language/Dictionaries", "language/Translation", "../../../IContext", "../../../Utilities/Item", "../../ContextData/SetContextData", "../../Core/ExecuteAction", "../../Core/ExecuteActionForItem", "../../Core/MoveToTarget", "../../Core/ReserveItems", "../../Utility/CompleteRequirements", "../../Utility/MoveToLand", "./AcquireBase", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, IItemManager_1, Dictionaries_1, Translation_1, IContext_1, Item_1, SetContextData_1, ExecuteAction_1, ExecuteActionForItem_1, MoveToTarget_1, ReserveItems_1, CompleteRequirements_1, MoveToLand_1, AcquireBase_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemWithRecipe extends AcquireBase_1.default {
        constructor(itemType, recipe) {
            super();
            this.itemType = itemType;
            this.recipe = recipe;
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
            const checker = Item_1.processRecipe(context, this.recipe, false);
            const checkerWithIntermediateChest = Item_1.processRecipe(context, this.recipe, true);
            const availableInventoryWeight = Item_1.getAvailableInventoryWeight(context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1XaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZS9JdGVtL0FjcXVpcmVJdGVtV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF3QkEsTUFBcUIscUJBQXNCLFNBQVEscUJBQVc7UUFFN0QsWUFBNkIsUUFBa0IsRUFBbUIsTUFBZTtZQUNoRixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQVM7UUFFakYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx5QkFBeUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUMzRCxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QjtZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBRWhHLE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU3RixNQUFNLE9BQU8sR0FBRyxvQkFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNELE1BQU0sNEJBQTRCLEdBQUcsb0JBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUvRSxNQUFNLHdCQUF3QixHQUFHLGtDQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RF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
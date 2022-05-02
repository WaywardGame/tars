define(["require", "exports", "@wayward/goodstream/Stream", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionary", "language/ITranslation", "language/Translation", "../../../core/context/IContext", "../../../core/objective/Objective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Stream_1, IAction_1, IItem_1, Items_1, Dictionary_1, ITranslation_1, Translation_1, IContext_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemFromDismantle extends Objective_1.default {
        constructor(itemType, dismantleItemTypes) {
            super();
            this.itemType = itemType;
            this.dismantleItemTypes = dismantleItemTypes;
        }
        getIdentifier() {
            return `AcquireItemFromDismantle:${IItem_1.ItemType[this.itemType]}:${Array.from(this.dismantleItemTypes).map((itemType) => IItem_1.ItemType[itemType]).join(",")}`;
        }
        getStatus() {
            const translation = Stream_1.default.values(Array.from(this.dismantleItemTypes).map(itemType => Translation_1.default.nameOf(Dictionary_1.default.Item, itemType)))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
        }
        shouldIncludeContextHashCode(context) {
            for (const itemType of this.dismantleItemTypes) {
                if (context.isReservedItemType(itemType)) {
                    return true;
                }
            }
            return false;
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const itemType of this.dismantleItemTypes) {
                const description = Items_1.itemDescriptions[itemType];
                if (!description || !description.dismantle) {
                    continue;
                }
                const dismantleItem = context.utilities.item.getItemInInventory(context, itemType);
                const objectives = [
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new SetContextData_1.default(IContext_1.ContextDataType.NextActionAllowsIntermediateChest, false),
                ];
                const hashCode = this.getHashCode(context, true);
                if (dismantleItem === undefined || !context.utilities.item.canDestroyItem(context, dismantleItem)) {
                    objectives.push(new AcquireItem_1.default(itemType, { willDestroyItem: true }).setContextDataKey(hashCode));
                }
                else {
                    objectives.push(new ReserveItems_1.default(dismantleItem));
                    objectives.push(new SetContextData_1.default(hashCode, dismantleItem));
                }
                let requiredItemHashCode;
                let requiredItem;
                if (description.dismantle.required !== undefined) {
                    requiredItemHashCode = `${this.getHashCode(context)}:${this.getUniqueIdentifier()}`;
                    requiredItem = context.island.items.getItemForHuman(context.human, description.dismantle.required, {
                        excludeProtectedItems: true,
                        includeProtectedItemsThatWillNotBreak: IAction_1.ActionType.Dismantle,
                    });
                    if (requiredItem === undefined) {
                        objectives.push(new AcquireItemByGroup_1.default(description.dismantle.required).setContextDataKey(requiredItemHashCode));
                    }
                    else {
                        objectives.push(new ReserveItems_1.default(requiredItem));
                        objectives.push(new SetContextData_1.default(requiredItemHashCode, requiredItem));
                    }
                }
                if (context.human.isSwimming()) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    actionType: IAction_1.ActionType.Dismantle,
                    executor: (context, action) => {
                        const item = context.getData(hashCode);
                        if (!item?.isValid()) {
                            this.log.warn(`Missing dismantle item ${item}. Bug in TARS pipeline, will fix itself`, hashCode);
                            return;
                        }
                        let requiredItem;
                        if (requiredItemHashCode) {
                            requiredItem = context.getData(requiredItemHashCode);
                            if (requiredItem && !requiredItem.isValid()) {
                                this.log.warn(`Missing required item "${requiredItem}" for dismantle. Bug in TARS pipeline, will fix itself. Hash code: ${requiredItemHashCode}`);
                                return;
                            }
                        }
                        action.execute(context.actionExecutor, item, requiredItem);
                    },
                }).passAcquireData(this).setStatus(() => `Dismantling ${Translation_1.default.nameOf(Dictionary_1.default.Item, itemType).inContext(ITranslation_1.TextContext.Lowercase).getString()} for ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 5;
        }
    }
    exports.default = AcquireItemFromDismantle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzbWFudGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtRnJvbURpc21hbnRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF5QkEsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsUUFBa0IsRUFBbUIsa0JBQWlDO1lBQ2xHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFlO1FBRW5HLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBa0IsRUFBRSxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9KLENBQUM7UUFFTSxTQUFTO1lBQ2YsTUFBTSxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNuSSxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsV0FB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
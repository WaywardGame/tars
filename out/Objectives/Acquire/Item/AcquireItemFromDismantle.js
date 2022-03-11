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
                if (dismantleItem === undefined) {
                    objectives.push(new AcquireItem_1.default(itemType).setContextDataKey(hashCode));
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
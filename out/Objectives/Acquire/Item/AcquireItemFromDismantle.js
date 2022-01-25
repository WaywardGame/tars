define(["require", "exports", "@wayward/goodstream/Stream", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionary", "language/ITranslation", "language/Translation", "../../../core/context/IContext", "../../../core/objective/Objective", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Stream_1, IAction_1, IItem_1, Items_1, Dictionary_1, ITranslation_1, Translation_1, IContext_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemFromDismantle extends Objective_1.default {
        constructor(itemType, dismantleItemTypes) {
            super();
            this.itemType = itemType;
            this.dismantleItemTypes = dismantleItemTypes;
        }
        getIdentifier() {
            return `AcquireItemFromDismantle:${IItem_1.ItemType[this.itemType]}:${this.dismantleItemTypes.map((itemType) => IItem_1.ItemType[itemType]).join(",")}`;
        }
        getStatus() {
            const translation = Stream_1.default.values(Array.from(new Set(this.dismantleItemTypes)).map(itemType => Translation_1.default.nameOf(Dictionary_1.default.Item, itemType)))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.dismantleItemTypes.some(itemType => context.isReservedItemType(itemType));
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const itemType of this.dismantleItemTypes) {
                const description = Items_1.itemDescriptions[itemType];
                if (!description || !description.dismantle) {
                    continue;
                }
                const dismantleItem = context.utilities.item.getItemInInventory(context, itemType);
                const hasRequirements = description.dismantle.required === undefined || context.island.items.getItemForHuman(context.player, description.dismantle.required, { excludeProtectedItems: true, includeProtectedItemsThatWillNotBreak: IAction_1.ActionType.Dismantle }) !== undefined;
                const objectives = [
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new SetContextData_1.default(IContext_1.ContextDataType.NextActionAllowsIntermediateChest, false),
                ];
                const hashCode = this.getHashCode(true);
                if (dismantleItem === undefined) {
                    objectives.push(new AcquireItem_1.default(itemType).setContextDataKey(hashCode));
                }
                else {
                    objectives.push(new ReserveItems_1.default(dismantleItem));
                    objectives.push(new SetContextData_1.default(hashCode, dismantleItem));
                }
                if (!hasRequirements) {
                    objectives.push(new AcquireItemByGroup_1.default(description.dismantle.required));
                }
                if (context.player.isSwimming()) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], IAction_1.ActionType.Dismantle, (context, action) => {
                    const item = context.getData(hashCode);
                    if (!(item === null || item === void 0 ? void 0 : item.isValid())) {
                        this.log.warn(`Missing dismantle item ${item}. Bug in TARS pipeline, will fix itself`, hashCode);
                        return;
                    }
                    action.execute(context.player, item);
                }).passAcquireData(this).setStatus(() => `Dismantling ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzbWFudGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtRnJvbURpc21hbnRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF3QkEsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsUUFBa0IsRUFBbUIsa0JBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFZO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbkosQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDNUksT0FBTyxDQUFDLHFCQUFXLENBQUMsVUFBVSxFQUFFLHdCQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFaEQsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLFdBQVcsQ0FB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
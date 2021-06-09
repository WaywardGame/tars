define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionaries", "language/Translation", "../../../IContext", "../../../Objective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../utility/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, Items_1, Dictionaries_1, Translation_1, IContext_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
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
            const translation = Stream.values(Array.from(new Set(this.dismantleItemTypes)).map(itemType => Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, itemType)))
                .collect(Translation_1.default.formatList, Translation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
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
                const dismantleItem = Item_1.itemUtilities.getItemInInventory(context, itemType);
                const hasRequirements = description.dismantle.required === undefined || itemManager.getItemForHuman(context.player, description.dismantle.required, false) !== undefined;
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
                if (context.player.swimming) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], IAction_1.ActionType.Dismantle, (context, action) => {
                    const item = context.getData(hashCode);
                    if (!item) {
                        this.log.warn("Missing dismantle item. Bug in TARS pipeline, will fix itself", item, hashCode);
                        return;
                    }
                    action.execute(context.player, item);
                }).passContextDataKey(this).setStatus(() => `Dismantling ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()}`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzbWFudGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtRnJvbURpc21hbnRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF5QkEsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsUUFBa0IsRUFBbUIsa0JBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFZO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbkosQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUM1SSxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsdUJBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsV0FBVyxDQUFD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
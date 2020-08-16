define(["require", "exports", "entity/action/IAction", "item/IItem", "item/Items", "../../../Context", "../../../Objective", "../../../Utilities/Item", "../../ContextData/SetContextData", "../../Core/ExecuteActionForItem", "../../Core/ReserveItems", "../../Utility/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, Items_1, Context_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemFromDismantle extends Objective_1.default {
        constructor(itemType, dismantleItemTypes) {
            super();
            this.itemType = itemType;
            this.dismantleItemTypes = dismantleItemTypes;
        }
        getIdentifier() {
            return `AcquireItemFromDismantle:${IItem_1.ItemType[this.itemType]}:${this.dismantleItemTypes.map((itemType) => IItem_1.ItemType[itemType])}`;
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
                const dismantleItem = Item_1.getItemInInventory(context, itemType);
                const hasRequirements = description.dismantle.required === undefined || itemManager.countItemsInContainerByGroup(context.player.inventory, description.dismantle.required) > 0;
                const objectives = [
                    new SetContextData_1.default(Context_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new SetContextData_1.default(Context_1.ContextDataType.NextActionAllowsIntermediateChest, false),
                ];
                const hashCode = this.getHashCode();
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
                }));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 10;
        }
    }
    exports.default = AcquireItemFromDismantle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzbWFudGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZS9JdGVtL0FjcXVpcmVJdGVtRnJvbURpc21hbnRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsUUFBa0IsRUFBbUIsa0JBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFZO1FBRWhHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6SSxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDL0MsTUFBTSxXQUFXLEdBQUcsd0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO29CQUMzQyxTQUFTO2lCQUNUO2dCQUVELE1BQU0sYUFBYSxHQUFHLHlCQUFrQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFL0ssTUFBTSxVQUFVLEdBQWlCO29CQUNoQyxJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUM7b0JBQzVGLElBQUksd0JBQWMsQ0FBQyx5QkFBZSxDQUFDLGlDQUFpQyxFQUFFLEtBQUssQ0FBQztpQkFDNUUsQ0FBQztnQkFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRXBDLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtvQkFDaEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFFdkU7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDakQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7aUJBQzdEO2dCQUVELElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3JCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pFO2dCQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBVSxFQUFFLENBQUMsQ0FBQztpQkFDbEM7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxvQkFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDOUgsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBTyxRQUFRLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrREFBK0QsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQy9GLE9BQU87cUJBQ1A7b0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUtTLGlCQUFpQixDQUFDLE9BQWdCO1lBRTNDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNEO0lBNUVELDJDQTRFQyJ9
define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "item/IItem", "item/Items", "utilities/enum/Enums", "../../../Objective", "../../../Utilities/Doodad", "./AcquireItem"], function (require, exports, IDoodad_1, IAction_1, IItem_1, Items_1, Enums_1, Objective_1, Doodad_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        getIdentifier() {
            return `AcquireItemForDoodad:${doodadManager.isGroup(this.doodadTypeOrGroup) ? IDoodad_1.DoodadTypeGroup[this.doodadTypeOrGroup] : IDoodad_1.DoodadType[this.doodadTypeOrGroup]}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.getItems().some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return this.getItems()
                .map(item => [new AcquireItem_1.default(item).passContextDataKey(this)]);
        }
        getItems() {
            let result = AcquireItemForDoodad.cache.get(this.doodadTypeOrGroup);
            if (result === undefined) {
                result = [];
                const doodadTypes = Doodad_1.getDoodadTypes(this.doodadTypeOrGroup);
                for (const doodadType of doodadTypes) {
                    for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                        const itemDescription = Items_1.itemDescriptions[itemType];
                        if (itemDescription && itemDescription.onUse &&
                            (itemDescription.onUse[IAction_1.ActionType.Build] === doodadType || itemDescription.onUse[IAction_1.ActionType.PlaceDown] === doodadType)) {
                            result.push(itemType);
                        }
                    }
                }
                AcquireItemForDoodad.cache.set(this.doodadTypeOrGroup, result);
            }
            return result;
        }
    }
    exports.default = AcquireItemForDoodad;
    AcquireItemForDoodad.cache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JEb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUl0ZW1Gb3JEb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsaUJBQStDO1lBQzNFLEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFFNUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMseUJBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1FBQy9KLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRTtpQkFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFTyxRQUFRO1lBQ2YsSUFBSSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwRSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosTUFBTSxXQUFXLEdBQUcsdUJBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDM0QsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7b0JBQ3JDLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLEVBQUU7d0JBQzlDLE1BQU0sZUFBZSxHQUFHLHdCQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hDLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxLQUFLOzRCQUMzQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxVQUFVLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxFQUFFOzRCQUN4SCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUN0QjtxQkFDRDtpQkFDRDtnQkFFRCxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQzs7SUE3Q0YsdUNBOENDO0lBNUN3QiwwQkFBSyxHQUFrRCxJQUFJLEdBQUcsRUFBRSxDQUFDIn0=
define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionaries", "language/Translation", "utilities/enum/Enums", "../../../Objective", "../../../utilities/Doodad", "./AcquireItem"], function (require, exports, IDoodad_1, IAction_1, IItem_1, Items_1, Dictionaries_1, Translation_1, Enums_1, Objective_1, Doodad_1, AcquireItem_1) {
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
        getStatus() {
            return `Acquiring ${doodadManager.isGroup(this.doodadTypeOrGroup) ? Translation_1.default.nameOf(Dictionaries_1.Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation_1.default.nameOf(Dictionaries_1.Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.getItems().some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return this.getItems()
                .map(item => [new AcquireItem_1.default(item, { requiredMinDur: 1 }).passContextDataKey(this)]);
        }
        getItems() {
            let result = AcquireItemForDoodad.cache.get(this.doodadTypeOrGroup);
            if (result === undefined) {
                result = [];
                const doodadTypes = Doodad_1.doodadUtilities.getDoodadTypes(this.doodadTypeOrGroup);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JEb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL0l0ZW0vQWNxdWlyZUl0ZW1Gb3JEb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsaUJBQStDO1lBQzNFLEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFFNUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMseUJBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1FBQy9KLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xPLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBRW5CLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRTtpQkFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFTyxRQUFRO1lBQ2YsSUFBSSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwRSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosTUFBTSxXQUFXLEdBQUcsd0JBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzNFLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO29CQUNyQyxLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO3dCQUM5QyxNQUFNLGVBQWUsR0FBRyx3QkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN4QyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsS0FBSzs0QkFDM0MsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxVQUFVLENBQUMsRUFBRTs0QkFDeEgsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDdEI7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDL0Q7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7O0lBbERGLHVDQW1EQztJQWpEd0IsMEJBQUssR0FBa0QsSUFBSSxHQUFHLEVBQUUsQ0FBQyJ9
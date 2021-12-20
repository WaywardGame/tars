define(["require", "exports", "game/doodad/DoodadManager", "game/doodad/IDoodad", "game/entity/action/IAction", "game/item/IItem", "game/item/Items", "language/Dictionary", "language/Translation", "utilities/enum/Enums", "../../../Objective", "../../../utilities/Doodad", "./AcquireItem"], function (require, exports, DoodadManager_1, IDoodad_1, IAction_1, IItem_1, Items_1, Dictionary_1, Translation_1, Enums_1, Objective_1, Doodad_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        getIdentifier() {
            return `AcquireItemForDoodad:${DoodadManager_1.default.isGroup(this.doodadTypeOrGroup) ? IDoodad_1.DoodadTypeGroup[this.doodadTypeOrGroup] : IDoodad_1.DoodadType[this.doodadTypeOrGroup]}`;
        }
        getStatus() {
            return `Acquiring ${DoodadManager_1.default.isGroup(this.doodadTypeOrGroup) ? Translation_1.default.nameOf(Dictionary_1.default.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation_1.default.nameOf(Dictionary_1.default.Doodad, this.doodadTypeOrGroup).getString()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.getItems().some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return this.getItems()
                .map(item => [new AcquireItem_1.default(item, { requiredMinDur: 1 }).passAcquireData(this)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JEb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gb3JEb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBSTFELFlBQTZCLGlCQUErQztZQUMzRSxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1FBRTVFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLHVCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7UUFDL0osQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsdUJBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xPLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBRW5CLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRTtpQkFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRU8sUUFBUTtZQUNmLElBQUksTUFBTSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDcEUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUVaLE1BQU0sV0FBVyxHQUFHLHdCQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMzRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtvQkFDckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFRLENBQUMsRUFBRTt3QkFDOUMsTUFBTSxlQUFlLEdBQUcsd0JBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLEtBQUs7NEJBQzNDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLFVBQVUsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssVUFBVSxDQUFDLEVBQUU7NEJBQ3hILE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ3RCO3FCQUNEO2lCQUNEO2dCQUVELG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQy9EO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQWxERix1Q0FtREM7SUFqRHdCLDBCQUFLLEdBQWtELElBQUksR0FBRyxFQUFFLENBQUMifQ==
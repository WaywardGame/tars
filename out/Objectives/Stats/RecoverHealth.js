define(["require", "exports", "Enums", "../../Helpers", "../../Objective", "../AcquireItem", "../UseItem"], function (require, exports, Enums_1, Helpers, Objective_1, AcquireItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Health extends Objective_1.default {
        onExecute(base, inventory) {
            const healItems = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Heal);
            if (healItems.length > 0) {
                this.log(`Healing with ${game.getName(healItems[0])}`);
                return new UseItem_1.default(healItems[0], Enums_1.ActionType.Heal);
            }
            this.log("Acquire a Tourniquet");
            return new AcquireItem_1.default(Enums_1.ItemType.Tourniquet);
        }
    }
    exports.default = Health;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1N0YXRzL1JlY292ZXJIZWFsdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsWUFBNEIsU0FBUSxtQkFBUztRQUVyQyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUVEO0lBYkQseUJBYUMifQ==
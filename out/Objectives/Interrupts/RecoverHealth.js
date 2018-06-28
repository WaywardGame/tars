define(["require", "exports", "Enums", "../Helpers", "../Objective", "./AcquireItem", "./UseItem"], function (require, exports, Enums_1, Helpers, Objective_1, AcquireItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHealth extends Objective_1.default {
        onExecute(base, inventory) {
            const healItems = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Heal);
            if (healItems.length > 0) {
                this.log(`Healing with ${game.getName(healItems[0])}`);
                return new UseItem_1.default(healItems[0], Enums_1.ActionType.Heal);
            }
            this.log("Acquire a Health item");
            return new AcquireItem_1.default(Enums_1.ItemTypeGroup.Health);
        }
    }
    exports.default = RecoverHealth;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdHMvUmVjb3ZlckhlYWx0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxtQkFBbUMsU0FBUSxtQkFBUztRQUU1QyxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsSUFBSSxxQkFBVyxDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUVEO0lBYkQsZ0NBYUMifQ==
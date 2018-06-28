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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVhbHRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvU3RhdHMvSGVhbHRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLFlBQTRCLFNBQVEsbUJBQVM7UUFFckMsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUN2RCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxrQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FFRDtJQWJELHlCQWFDIn0=
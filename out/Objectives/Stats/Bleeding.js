define(["require", "exports", "Enums", "../../Helpers", "../../Objective", "../AcquireItem", "../UseItem"], function (require, exports, Enums_1, Helpers, Objective_1, AcquireItem_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Bleeding extends Objective_1.default {
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
    exports.default = Bleeding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxlZWRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9TdGF0cy9CbGVlZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxjQUE4QixTQUFRLG1CQUFTO1FBRXZDLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7WUFDdkQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBRUQ7SUFiRCwyQkFhQyJ9
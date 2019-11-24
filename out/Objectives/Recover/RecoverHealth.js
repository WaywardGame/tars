define(["require", "exports", "entity/action/IAction", "entity/IStats", "entity/player/IPlayer", "../../Objective", "../../Utilities/Item", "../Acquire/Item/AcquireItemForAction", "../Other/UseItem", "../Utility/OrganizeInventory"], function (require, exports, IAction_1, IStats_1, IPlayer_1, Objective_1, Item_1, AcquireItemForAction_1, UseItem_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHealth extends Objective_1.default {
        constructor() {
            super(...arguments);
            this.saveChildObjectives = false;
        }
        getIdentifier() {
            return "RecoverHealth";
        }
        canSaveChildObjectives() {
            return this.saveChildObjectives;
        }
        async execute(context) {
            const healItems = Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Heal);
            if (healItems.length > 0) {
                this.log.info(`Healing with ${healItems[0].getName().getString()}`);
                return new UseItem_1.default(IAction_1.ActionType.Heal, healItems[0]);
            }
            const isThirsty = context.player.stat.get(IStats_1.Stat.Thirst).value <= 0;
            const isHungry = !context.player.status.Bleeding && context.player.stat.get(IStats_1.Stat.Hunger).value <= 0;
            const hasWeightProblems = context.player.getWeightStatus() !== IPlayer_1.WeightStatus.None;
            this.saveChildObjectives = !hasWeightProblems;
            const objectives = [];
            if (hasWeightProblems) {
                this.log.info("Reduce weight before finding a health item");
                objectives.push(new OrganizeInventory_1.default(false));
            }
            else if (!isThirsty && !isHungry) {
                this.log.info("Acquire a Health item");
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Heal));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Heal));
            }
            return objectives;
        }
    }
    exports.default = RecoverHealth;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXIvUmVjb3ZlckhlYWx0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFBcEQ7O1lBRVMsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1FBd0NyQyxDQUFDO1FBdENPLGFBQWE7WUFDbkIsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFNBQVMsR0FBRywrQkFBd0IsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDcEUsT0FBTyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDekUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzNHLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLElBQUksQ0FBQztZQUVqRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztZQUU5QyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksaUJBQWlCLEVBQUU7Z0JBRXRCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7Z0JBQzVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBRTlDO2lCQUFNLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM5QztZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQTFDRCxnQ0EwQ0MifQ==
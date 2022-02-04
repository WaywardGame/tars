define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../other/item/UseItem", "../utility/OrganizeInventory"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, AcquireItemForAction_1, UseItem_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHealth extends Objective_1.default {
        constructor(onlyUseAvailableItems) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
            this.saveChildObjectives = false;
        }
        getIdentifier() {
            return `RecoverHealth:${this.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering health";
        }
        canSaveChildObjectives() {
            return this.saveChildObjectives;
        }
        async execute(context) {
            const healItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Heal);
            if (healItems.length > 0) {
                this.log.info(`Healing with ${healItems[0].getName().getString()}`);
                return new UseItem_1.default(IAction_1.ActionType.Heal, healItems[0]);
            }
            if (this.onlyUseAvailableItems) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isThirsty = context.human.stat.get(IStats_1.Stat.Thirst).value <= 0;
            const isHungry = !context.human.status.Bleeding && context.human.stat.get(IStats_1.Stat.Hunger).value <= 0;
            const hasWeightProblems = context.human.getWeightStatus() !== IPlayer_1.WeightStatus.None;
            this.saveChildObjectives = !hasWeightProblems;
            const objectives = [];
            if (hasWeightProblems) {
                this.log.info("Reduce weight before finding a health item");
                objectives.push(new OrganizeInventory_1.default({ allowChests: false }));
            }
            else if (!isThirsty && !isHungry) {
                this.log.info("Acquire a Health item");
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Heal).keepInInventory());
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Heal));
            }
            return objectives;
        }
    }
    exports.default = RecoverHealth;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlckhlYWx0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFJbkQsWUFBNkIscUJBQThCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBRG9CLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUztZQUZuRCx3QkFBbUIsR0FBRyxLQUFLLENBQUM7UUFJcEMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLG1CQUFtQixDQUFDO1FBQzVCLENBQUM7UUFFZSxzQkFBc0I7WUFDckMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUYsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3BFLE9BQU8sSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDeEUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ3pHLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLElBQUksQ0FBQztZQUVoRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztZQUU5QyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksaUJBQWlCLEVBQUU7Z0JBRXRCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7Z0JBQzVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBaUIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFFL0Q7aUJBQU0sSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFFdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztnQkFDN0UsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBdERELGdDQXNEQyJ9
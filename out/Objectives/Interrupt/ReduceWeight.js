define(["require", "exports", "entity/player/IPlayer", "../../IObjective", "../../Objective", "../Utility/OrganizeInventory"], function (require, exports, IPlayer_1, IObjective_1, Objective_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReduceWeight extends Objective_1.default {
        constructor(includeReservedItems = false) {
            super();
            this.includeReservedItems = includeReservedItems;
        }
        getIdentifier() {
            return "ReduceWeight";
        }
        canSaveChildObjectives() {
            return false;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            const weightStatus = context.player.getWeightStatus();
            if (weightStatus === IPlayer_1.WeightStatus.None) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            return new OrganizeInventory_1.default({
                allowChests: weightStatus !== IPlayer_1.WeightStatus.Overburdened,
                includeReservedItems: this.includeReservedItems,
            });
        }
    }
    exports.default = ReduceWeight;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0L1JlZHVjZVdlaWdodC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsdUJBQWdDLEtBQUs7WUFDakUsS0FBSyxFQUFFLENBQUM7WUFEb0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFpQjtRQUVsRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sc0JBQXNCO1lBQzVCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdEQsSUFBSSxZQUFZLEtBQUssc0JBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxPQUFPLElBQUksMkJBQWlCLENBQUM7Z0JBQzVCLFdBQVcsRUFBRSxZQUFZLEtBQUssc0JBQVksQ0FBQyxZQUFZO2dCQUN2RCxvQkFBb0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CO2FBQy9DLENBQUMsQ0FBQztRQUNKLENBQUM7S0FFRDtJQWxDRCwrQkFrQ0MifQ==
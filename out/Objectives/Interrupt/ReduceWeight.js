define(["require", "exports", "game/entity/player/IPlayer", "../../IObjective", "../../Objective", "../Utility/OrganizeInventory"], function (require, exports, IPlayer_1, IObjective_1, Objective_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReduceWeight extends Objective_1.default {
        constructor(options = {}) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return "ReduceWeight";
        }
        getStatus() {
            return "Reducing weight";
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
                ...this.options,
            });
        }
    }
    exports.default = ReduceWeight;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0L1JlZHVjZVdlaWdodC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsVUFBc0MsRUFBRTtZQUNwRSxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUFpQztRQUVyRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3RELElBQUksWUFBWSxLQUFLLHNCQUFZLENBQUMsSUFBSSxFQUFFO2dCQUN2QyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsT0FBTyxJQUFJLDJCQUFpQixDQUFDO2dCQUM1QixXQUFXLEVBQUUsWUFBWSxLQUFLLHNCQUFZLENBQUMsWUFBWTtnQkFDdkQsR0FBRyxJQUFJLENBQUMsT0FBTzthQUNmLENBQUMsQ0FBQztRQUNKLENBQUM7S0FFRDtJQXRDRCwrQkFzQ0MifQ==
define(["require", "exports", "game/entity/IStats", "../../IObjective", "../../Objective", "../../utilities/Player", "../../utilities/Tile", "../other/Idle", "../other/Rest"], function (require, exports, IStats_1, IObjective_1, Objective_1, Player_1, Tile_1, Idle_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverStamina extends Objective_1.default {
        getIdentifier() {
            return "RecoverStamina";
        }
        getStatus() {
            return "Recovering stamina";
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.player.status.Poisoned || context.player.status.Burned) {
                if (context.player.stat.get(IStats_1.Stat.Stamina).value <= 1) {
                    this.log.info("Emergency idling");
                    return new Idle_1.default(false);
                }
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (Tile_1.tileUtilities.isSwimmingOrOverWater(context) && Player_1.playerUtilities.isUsingVehicle(context)) {
                this.log.info("Idling to recover stamina");
                return new Idle_1.default(false);
            }
            if (context.player.stat.get(IStats_1.Stat.Thirst).value < 1) {
                this.log.info("Can't rest now, too thirsty");
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (context.player.stat.get(IStats_1.Stat.Hunger).value < 1) {
                this.log.info("Can't rest now, too hungry");
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new Rest_1.default(true);
        }
    }
    exports.default = RecoverStamina;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclN0YW1pbmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9yZWNvdmVyL1JlY292ZXJTdGFtaW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUU3QyxhQUFhO1lBQ25CLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25FLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUU1RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUNsQyxPQUFPLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN2QjtnQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsSUFBSSxvQkFBYSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLHdCQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM1RixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO1lBUUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBQzdDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE9BQU8sSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQztLQUVEO0lBakRELGlDQWlEQyJ9
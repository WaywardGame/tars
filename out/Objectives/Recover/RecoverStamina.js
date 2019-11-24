define(["require", "exports", "entity/IStats", "../../IObjective", "../../Objective", "../Other/Idle", "../Other/Rest"], function (require, exports, IStats_1, IObjective_1, Objective_1, Idle_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverStamina extends Objective_1.default {
        getIdentifier() {
            return "RecoverStamina";
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
            return new Rest_1.default(true);
        }
    }
    exports.default = RecoverStamina;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclN0YW1pbmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9SZWNvdmVyL1JlY292ZXJTdGFtaW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUU3QyxhQUFhO1lBQ25CLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDbkUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7b0JBRTVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ2xDLE9BQU8sSUFBSSxjQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3ZCO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFRRCxPQUFPLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7S0FFRDtJQTlCRCxpQ0E4QkMifQ==
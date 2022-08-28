define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlayerUtilities = void 0;
    class PlayerUtilities {
        getWeight(context) {
            return context.human.stat.get(IStats_1.Stat.Weight).value;
        }
        getMaxWeight(context) {
            return context.human.stat.get(IStats_1.Stat.Weight).max;
        }
        isUsingVehicle(context) {
            return !!context.human.vehicleItemReference;
        }
        isHealthy(context) {
            return context.human.stat.get(IStats_1.Stat.Health).value > 8 && context.human.stat.get(IStats_1.Stat.Hunger).value > 8;
        }
        getRecoverThreshold(context, stat) {
            let recoverThreshold;
            switch (stat) {
                case IStats_1.Stat.Health:
                    recoverThreshold = context.options.recoverThresholdHealth;
                    break;
                case IStats_1.Stat.Stamina:
                    recoverThreshold = context.options.recoverThresholdStamina;
                    break;
                case IStats_1.Stat.Hunger:
                    recoverThreshold = context.options.recoverThresholdHunger;
                    break;
                case IStats_1.Stat.Thirst:
                    recoverThreshold = [context.options.recoverThresholdThirst, context.options.recoverThresholdThirstFromMax];
                    break;
                default:
                    throw new Error(`Invalid recover threshold stat ${stat}`);
            }
            if (Array.isArray(recoverThreshold)) {
                recoverThreshold = Math.min(...recoverThreshold.map((threshold) => this.parseThreshold(context, stat, threshold)));
            }
            else {
                recoverThreshold = this.parseThreshold(context, stat, recoverThreshold);
            }
            return recoverThreshold;
        }
        parseThreshold(context, stat, threshold) {
            return threshold > 0 ? threshold : context.human.stat.get(stat).max + threshold;
        }
    }
    exports.PlayerUtilities = PlayerUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLE1BQWEsZUFBZTtRQUVwQixTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RCxDQUFDO1FBRU0sWUFBWSxDQUFDLE9BQWdCO1lBQ25DLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDMUQsQ0FBQztRQUVNLGNBQWMsQ0FBQyxPQUFnQjtZQUNyQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQzdDLENBQUM7UUFFTSxTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNILENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDdEQsSUFBSSxnQkFBbUMsQ0FBQztZQUV4QyxRQUFRLElBQUksRUFBRTtnQkFDYixLQUFLLGFBQUksQ0FBQyxNQUFNO29CQUNmLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7b0JBQzFELE1BQU07Z0JBRVAsS0FBSyxhQUFJLENBQUMsT0FBTztvQkFDaEIsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztvQkFDM0QsTUFBTTtnQkFFUCxLQUFLLGFBQUksQ0FBQyxNQUFNO29CQUNmLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7b0JBQzFELE1BQU07Z0JBRVAsS0FBSyxhQUFJLENBQUMsTUFBTTtvQkFDZixnQkFBZ0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUMzRyxNQUFNO2dCQUVQO29CQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLElBQUksRUFBRSxDQUFDLENBQUM7YUFDM0Q7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDcEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuSDtpQkFBTTtnQkFDTixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUN4RTtZQUVELE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFnQixFQUFFLElBQVUsRUFBRSxTQUFpQjtZQUNyRSxPQUFPLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFDM0YsQ0FBQztLQUNEO0lBdERELDBDQXNEQyJ9
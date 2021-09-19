define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.playerUtilities = void 0;
    class PlayerUtilities {
        getWeight(context) {
            return context.player.stat.get(IStats_1.Stat.Weight).value;
        }
        getMaxWeight(context) {
            return context.player.stat.get(IStats_1.Stat.Weight).max;
        }
        isUsingVehicle(context) {
            return context.player.vehicleItemId !== undefined;
        }
        isHealthy(context) {
            return context.player.stat.get(IStats_1.Stat.Health).value > 8
                && context.player.stat.get(IStats_1.Stat.Hunger).value > 8;
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
            return threshold > 0 ? threshold : context.player.stat.get(stat).max + threshold;
        }
    }
    exports.playerUtilities = new PlayerUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLE1BQU0sZUFBZTtRQUViLFNBQVMsQ0FBQyxPQUFnQjtZQUNoQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdELENBQUM7UUFFTSxZQUFZLENBQUMsT0FBZ0I7WUFDbkMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMzRCxDQUFDO1FBRU0sY0FBYyxDQUFDLE9BQWdCO1lBQ3JDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDO1FBQ25ELENBQUM7UUFFTSxTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDO21CQUMzRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVNLG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsSUFBVTtZQUN0RCxJQUFJLGdCQUF3QyxDQUFDO1lBRTdDLFFBQVEsSUFBSSxFQUFFO2dCQUNiLEtBQUssYUFBSSxDQUFDLE1BQU07b0JBQ2YsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUQsTUFBTTtnQkFFUCxLQUFLLGFBQUksQ0FBQyxPQUFPO29CQUNoQixnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDO29CQUMzRCxNQUFNO2dCQUVQLEtBQUssYUFBSSxDQUFDLE1BQU07b0JBQ2YsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUQsTUFBTTtnQkFFUCxLQUFLLGFBQUksQ0FBQyxNQUFNO29CQUNmLGdCQUFnQixHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7b0JBQzNHLE1BQU07Z0JBRVA7b0JBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUMzRDtZQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUNwQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25IO2lCQUFNO2dCQUNOLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ3hFO1lBRUQsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBRU8sY0FBYyxDQUFDLE9BQWdCLEVBQUUsSUFBVSxFQUFFLFNBQWlCO1lBQ3JFLE9BQU8sU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztRQUM1RixDQUFDO0tBQ0Q7SUFFWSxRQUFBLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDIn0=
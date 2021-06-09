define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.playerUtilities = void 0;
    const recoverThresholds = {
        [IStats_1.Stat.Health]: 30,
        [IStats_1.Stat.Stamina]: 20,
        [IStats_1.Stat.Hunger]: 8,
        [IStats_1.Stat.Thirst]: [10, -10],
    };
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
            let recoverThreshold = recoverThresholds[stat];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVFBLE1BQU0saUJBQWlCLEdBQTJDO1FBQ2pFLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNsQixDQUFDLGFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2hCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3hCLENBQUM7SUFFRixNQUFNLGVBQWU7UUFFYixTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM3RCxDQUFDO1FBRU0sWUFBWSxDQUFDLE9BQWdCO1lBQ25DLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDM0QsQ0FBQztRQUVNLGNBQWMsQ0FBQyxPQUFnQjtZQUNyQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQztRQUNuRCxDQUFDO1FBRU0sU0FBUyxDQUFDLE9BQWdCO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQzttQkFDM0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDdEQsSUFBSSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUvQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDcEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuSDtpQkFBTTtnQkFDTixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUN4RTtZQUVELE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFnQixFQUFFLElBQVUsRUFBRSxTQUFpQjtZQUNyRSxPQUFPLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFDNUYsQ0FBQztLQUNEO0lBRVksUUFBQSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9
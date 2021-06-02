define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.playerUtilities = void 0;
    const recoverThresholds = {
        [IStats_1.Stat.Health]: 30,
        [IStats_1.Stat.Stamina]: 20,
        [IStats_1.Stat.Hunger]: 8,
        [IStats_1.Stat.Thirst]: 10,
    };
    class PlayerUtilities {
        isHealthy(context) {
            return context.player.stat.get(IStats_1.Stat.Health).value > 8
                && context.player.stat.get(IStats_1.Stat.Hunger).value > 8;
        }
        isUsingVehicle(context) {
            return context.player.vehicleItemId !== undefined;
        }
        getRecoverThreshold(context, stat) {
            const recoverThreshold = recoverThresholds[stat];
            return recoverThreshold > 0 ? recoverThreshold : context.player.stat.get(stat).max + recoverThreshold;
        }
    }
    exports.playerUtilities = new PlayerUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQU0saUJBQWlCLEdBQWdDO1FBQ3RELENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNsQixDQUFDLGFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2hCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDakIsQ0FBQztJQUVGLE1BQU0sZUFBZTtRQUViLFNBQVMsQ0FBQyxPQUFnQjtZQUNoQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUM7bUJBQzNELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU0sY0FBYyxDQUFDLE9BQWdCO1lBQ3JDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDO1FBQ25ELENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxPQUFPLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUM7UUFDakgsQ0FBQztLQUVEO0lBRVksUUFBQSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9
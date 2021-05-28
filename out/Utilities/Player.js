define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRecoverThreshold = exports.isUsingVehicle = exports.isHealthy = void 0;
    const recoverThresholds = {
        [IStats_1.Stat.Health]: 30,
        [IStats_1.Stat.Stamina]: 20,
        [IStats_1.Stat.Hunger]: 8,
        [IStats_1.Stat.Thirst]: 10,
    };
    function isHealthy(context) {
        return context.player.stat.get(IStats_1.Stat.Health).value > 8
            && context.player.stat.get(IStats_1.Stat.Hunger).value > 8;
    }
    exports.isHealthy = isHealthy;
    function isUsingVehicle(context) {
        return context.player.vehicleItemId !== undefined;
    }
    exports.isUsingVehicle = isUsingVehicle;
    function getRecoverThreshold(context, stat) {
        const recoverThreshold = recoverThresholds[stat];
        return recoverThreshold > 0 ? recoverThreshold : context.player.stat.get(stat).max + recoverThreshold;
    }
    exports.getRecoverThreshold = getRecoverThreshold;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQU0saUJBQWlCLEdBQWdDO1FBQ3RELENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNsQixDQUFDLGFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2hCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDakIsQ0FBQztJQUVGLFNBQWdCLFNBQVMsQ0FBQyxPQUFnQjtRQUN6QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUM7ZUFDM0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFIRCw4QkFHQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxPQUFnQjtRQUM5QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQztJQUNuRCxDQUFDO0lBRkQsd0NBRUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUM7SUFDakgsQ0FBQztJQUhELGtEQUdDIn0=
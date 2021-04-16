define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isUsingVehicle = exports.isHealthy = void 0;
    function isHealthy(context) {
        return context.player.stat.get(IStats_1.Stat.Health).value > 8
            && context.player.stat.get(IStats_1.Stat.Hunger).value > 8;
    }
    exports.isHealthy = isHealthy;
    function isUsingVehicle(context) {
        return context.player.vehicleItemId !== undefined;
    }
    exports.isUsingVehicle = isUsingVehicle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLFNBQWdCLFNBQVMsQ0FBQyxPQUFnQjtRQUN6QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUM7ZUFDM0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFIRCw4QkFHQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxPQUFnQjtRQUM5QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQztJQUNuRCxDQUFDO0lBRkQsd0NBRUMifQ==
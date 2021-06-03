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
        isHealthy(context) {
            return context.player.stat.get(IStats_1.Stat.Health).value > 8
                && context.player.stat.get(IStats_1.Stat.Hunger).value > 8;
        }
        isUsingVehicle(context) {
            return context.player.vehicleItemId !== undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVFBLE1BQU0saUJBQWlCLEdBQTJDO1FBQ2pFLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNsQixDQUFDLGFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2hCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3hCLENBQUM7SUFFRixNQUFNLGVBQWU7UUFFYixTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDO21CQUMzRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVNLGNBQWMsQ0FBQyxPQUFnQjtZQUNyQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQztRQUNuRCxDQUFDO1FBRU0sbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxJQUFVO1lBQ3RELElBQUksZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0MsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3BDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkg7aUJBQU07Z0JBQ04sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDeEU7WUFFRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTyxjQUFjLENBQUMsT0FBZ0IsRUFBRSxJQUFVLEVBQUUsU0FBaUI7WUFDckUsT0FBTyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBQzVGLENBQUM7S0FDRDtJQUVZLFFBQUEsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUMifQ==
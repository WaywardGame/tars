/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/IStats"], function (require, exports, IStats_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyVXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9QbGF5ZXJVdGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQU1ILE1BQWEsZUFBZTtRQUVwQixTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RCxDQUFDO1FBRU0sWUFBWSxDQUFDLE9BQWdCO1lBQ25DLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDMUQsQ0FBQztRQUVNLGNBQWMsQ0FBQyxPQUFnQjtZQUNyQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQzdDLENBQUM7UUFFTSxTQUFTLENBQUMsT0FBZ0I7WUFDaEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNILENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDdEQsSUFBSSxnQkFBbUMsQ0FBQztZQUV4QyxRQUFRLElBQUksRUFBRSxDQUFDO2dCQUNkLEtBQUssYUFBSSxDQUFDLE1BQU07b0JBQ2YsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUQsTUFBTTtnQkFFUCxLQUFLLGFBQUksQ0FBQyxPQUFPO29CQUNoQixnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDO29CQUMzRCxNQUFNO2dCQUVQLEtBQUssYUFBSSxDQUFDLE1BQU07b0JBQ2YsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUQsTUFBTTtnQkFFUCxLQUFLLGFBQUksQ0FBQyxNQUFNO29CQUNmLGdCQUFnQixHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7b0JBQzNHLE1BQU07Z0JBRVA7b0JBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztnQkFDckMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDekUsQ0FBQztZQUVELE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFnQixFQUFFLElBQVUsRUFBRSxTQUFpQjtZQUNyRSxPQUFPLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFDM0YsQ0FBQztLQUNEO0lBdERELDBDQXNEQyJ9
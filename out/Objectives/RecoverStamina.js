var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "../IObjective", "../Objective", "./Idle", "./Rest"], function (require, exports, IStats_1, IObjective_1, Objective_1, Idle_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverStamina extends Objective_1.default {
        getHashCode() {
            return "RecoverStamina";
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.status.Poisoned || localPlayer.status.Burned) {
                    if (localPlayer.getStat(IStats_1.Stat.Stamina).value <= 1) {
                        this.log.info("Emergency idling");
                        return new Idle_1.default(false);
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (localPlayer.getStat(IStats_1.Stat.Hunger).value <= 0 || localPlayer.getStat(IStats_1.Stat.Thirst).value <= 0) {
                    this.log.info("Can't rest now");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new Rest_1.default();
            });
        }
    }
    exports.default = RecoverStamina;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclN0YW1pbmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9SZWNvdmVyU3RhbWluYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQU9BLE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUU3QyxXQUFXO1lBQ2pCLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO29CQUM3RCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQVEsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7d0JBRXhELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ2xDLE9BQU8sSUFBSSxjQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3ZCO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUcsQ0FBQyxFQUFFO29CQUMzRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNoQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLElBQUksY0FBSSxFQUFFLENBQUM7WUFDbkIsQ0FBQztTQUFBO0tBRUQ7SUF6QkQsaUNBeUJDIn0=
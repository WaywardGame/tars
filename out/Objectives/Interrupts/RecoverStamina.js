define(["require", "exports", "../IObjective", "../Objective", "./Idle", "./Rest"], function (require, exports, IObjective_1, Objective_1, Idle_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverStamina extends Objective_1.default {
        onExecute(base, inventory) {
            if (localPlayer.status.poisoned || localPlayer.status.burned) {
                if (localPlayer.stats.stamina.value <= 1) {
                    return new Idle_1.default();
                }
                return IObjective_1.ObjectiveStatus.Complete;
            }
            return new Rest_1.default();
        }
    }
    exports.default = RecoverStamina;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlclN0YW1pbmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9JbnRlcnJ1cHRzL1JlY292ZXJTdGFtaW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU1BLG9CQUFvQyxTQUFRLG1CQUFTO1FBRTdDLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7WUFDdkQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFMUMsTUFBTSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUM7Z0JBQ25CLENBQUM7Z0JBRUQsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFmRCxpQ0FlQyJ9
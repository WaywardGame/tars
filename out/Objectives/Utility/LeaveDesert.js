define(["require", "exports", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Object", "../Core/MoveToTarget"], function (require, exports, IObjective_1, ITars_1, Objective_1, Object_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LeaveDesert extends Objective_1.default {
        getIdentifier() {
            return "LeaveDesert";
        }
        async execute(context) {
            if (context.player.y < ITars_1.desertCutoff) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const target = Object_1.findDoodad(context, "LeaveDesert", () => true);
            if (target === undefined) {
                this.log.info("Can't leave desert?");
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new MoveToTarget_1.default(target, true);
        }
    }
    exports.default = LeaveDesert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVhdmVEZXNlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9VdGlsaXR5L0xlYXZlRGVzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUUxQyxhQUFhO1lBQ25CLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsb0JBQVksRUFBRTtnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sTUFBTSxHQUFHLG1CQUFVLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU5RCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxPQUFPLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUVEO0lBckJELDhCQXFCQyJ9
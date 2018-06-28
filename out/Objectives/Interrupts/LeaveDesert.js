define(["require", "exports", "../Helpers", "../IObjective", "../ITars", "../Objective"], function (require, exports, Helpers, IObjective_1, ITars_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LeaveDesert extends Objective_1.default {
        onExecute(base, inventory) {
            if (localPlayer.y < ITars_1.desertCutoff) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            this.target = Helpers.findDoodad((doodad) => true);
            if (this.target === undefined) {
                this.log("Can't leave desert??");
                return IObjective_1.ObjectiveStatus.Complete;
            }
            const moveResult = Helpers.moveToTarget(this.target);
            if (moveResult === ITars_1.MoveResult.NoTarget) {
                this.log("No target to leave desert to");
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (moveResult === ITars_1.MoveResult.NoPath) {
                this.log("No path to leave desert");
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (moveResult === ITars_1.MoveResult.Complete) {
                this.log("Successfully left the desert");
                return IObjective_1.ObjectiveStatus.Complete;
            }
        }
    }
    exports.default = LeaveDesert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVhdmVEZXNlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9JbnRlcnJ1cHRzL0xlYXZlRGVzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLGlCQUFpQyxTQUFRLG1CQUFTO1FBSTFDLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7WUFDdkQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxvQkFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJELEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztRQUNGLENBQUM7S0FFRDtJQWxDRCw4QkFrQ0MifQ==
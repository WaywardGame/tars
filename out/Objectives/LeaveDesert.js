var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../IObjective", "../ITars", "../Objective", "../Utilities/Object", "../Utilities/Movement"], function (require, exports, IObjective_1, ITars_1, Objective_1, Object_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LeaveDesert extends Objective_1.default {
        getHashCode() {
            return "LeaveDesert";
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.y < ITars_1.desertCutoff) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                this.target = Object_1.findDoodad("LeaveDesert", (doodad) => true);
                if (this.target === undefined) {
                    this.log.info("Can't leave desert??");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToFaceTarget(this.target);
                if (moveResult === Movement_1.MoveResult.NoTarget) {
                    this.log.info("No target to leave desert to");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("No path to leave desert");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.Complete) {
                    this.log.info("Successfully left the desert");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
            });
        }
    }
    exports.default = LeaveDesert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVhdmVEZXNlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9MZWF2ZURlc2VydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLGlCQUFpQyxTQUFRLG1CQUFTO1FBSTFDLFdBQVc7WUFDakIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxJQUFJLFdBQVcsQ0FBQyxDQUFDLEdBQUcsb0JBQVksRUFBRTtvQkFDakMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxtQkFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRW5FLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUV2RCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztvQkFDOUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztZQUNGLENBQUM7U0FBQTtLQUVEO0lBdENELDhCQXNDQyJ9
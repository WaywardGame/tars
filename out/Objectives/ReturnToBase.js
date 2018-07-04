var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Base", "../Utilities/Movement"], function (require, exports, Vector2_1, IObjective_1, Objective_1, Base_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReturnToBase extends Objective_1.default {
        getHashCode() {
            return "ReturnToBase";
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const basePosition = Base_1.getBasePosition(base);
                if (basePosition === localPlayer || Vector2_1.default.squaredDistance(localPlayer, basePosition) <= 20) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToFaceTarget(basePosition);
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("Unable to find a path back to the base");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.Complete) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
            });
        }
    }
    exports.default = ReturnToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV0dXJuVG9CYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUmV0dXJuVG9CYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBT0Esa0JBQWtDLFNBQVEsbUJBQVM7UUFFM0MsV0FBVztZQUNqQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELE1BQU0sWUFBWSxHQUFHLHNCQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLElBQUksWUFBWSxLQUFLLFdBQVcsSUFBSSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFO29CQUM3RixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztvQkFDeEQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO1lBQ0YsQ0FBQztTQUFBO0tBRUQ7SUF2QkQsK0JBdUJDIn0=
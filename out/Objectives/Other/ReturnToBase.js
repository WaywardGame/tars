define(["require", "exports", "utilities/math/Vector2", "../../IObjective", "../../Objective", "../../Utilities/Base", "../Core/MoveToTarget"], function (require, exports, Vector2_1, IObjective_1, Objective_1, Base_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const returnToBaseDistance = 20;
    const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);
    class ReturnToBase extends Objective_1.default {
        getIdentifier() {
            return "ReturnToBase";
        }
        async execute(context) {
            const position = context.getPosition();
            const basePosition = Base_1.getBasePosition(context);
            if (position.z === basePosition.z && Vector2_1.default.squaredDistance(position, basePosition) <= returnToBaseDistanceSq) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info("Returning to base");
            return new MoveToTarget_1.default(basePosition, true);
        }
    }
    exports.default = ReturnToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV0dXJuVG9CYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvUmV0dXJuVG9CYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVqRSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFM0MsYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsTUFBTSxZQUFZLEdBQUcsc0JBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsSUFBSSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLElBQUksc0JBQXNCLEVBQUU7Z0JBQy9HLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRW5DLE9BQU8sSUFBSSxzQkFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBRUQ7SUFsQkQsK0JBa0JDIn0=
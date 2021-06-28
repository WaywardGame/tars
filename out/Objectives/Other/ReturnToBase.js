define(["require", "exports", "utilities/math/Vector2", "../../IObjective", "../../Objective", "../../utilities/Base", "../core/MoveToTarget"], function (require, exports, Vector2_1, IObjective_1, Objective_1, Base_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const returnToBaseDistance = 20;
    const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);
    class ReturnToBase extends Objective_1.default {
        getIdentifier() {
            return "ReturnToBase";
        }
        getStatus() {
            return "Returning to base";
        }
        async execute(context) {
            const position = context.getPosition();
            const basePosition = Base_1.baseUtilities.getBasePosition(context);
            if (position.z === basePosition.z && Vector2_1.default.squaredDistance(position, basePosition) <= returnToBaseDistanceSq) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info("Returning to base");
            return new MoveToTarget_1.default(basePosition, true);
        }
    }
    exports.default = ReturnToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV0dXJuVG9CYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvUmV0dXJuVG9CYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVqRSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFM0MsYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sWUFBWSxHQUFHLG9CQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVELElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxJQUFJLGlCQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxzQkFBc0IsRUFBRTtnQkFDL0csT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFFbkMsT0FBTyxJQUFJLHNCQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FFRDtJQXRCRCwrQkFzQkMifQ==
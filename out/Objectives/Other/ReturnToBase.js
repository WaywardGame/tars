define(["require", "exports", "utilities/math/Vector2", "../../IObjective", "../../Objective", "../../Utilities/Base", "../Core/MoveToTarget"], function (require, exports, Vector2_1, IObjective_1, Objective_1, Base_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReturnToBase extends Objective_1.default {
        getIdentifier() {
            return "ReturnToBase";
        }
        async execute(context) {
            const basePosition = Base_1.getBasePosition(context);
            if (basePosition === context.player || Vector2_1.default.distance(context.player, basePosition) <= 20) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            return new MoveToTarget_1.default(basePosition, true);
        }
    }
    exports.default = ReturnToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV0dXJuVG9CYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvUmV0dXJuVG9CYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUzQyxhQUFhO1lBQ25CLE9BQU8sY0FBYyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sWUFBWSxHQUFHLHNCQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxZQUFZLEtBQUssT0FBTyxDQUFDLE1BQU0sSUFBSSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDNUYsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE9BQU8sSUFBSSxzQkFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBRUQ7SUFmRCwrQkFlQyJ9
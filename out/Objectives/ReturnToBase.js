var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "utilities/math/Vector2", "../Helpers", "../IObjective", "../ITars", "../Objective"], function (require, exports, Vector2_1, Helpers, IObjective_1, ITars_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReturnToBase extends Objective_1.default {
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const basePosition = Helpers.getBasePosition(base);
                if (basePosition === localPlayer || Vector2_1.default.squaredDistance(localPlayer, basePosition) <= 20) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Helpers.moveToTarget(basePosition);
                if (moveResult === ITars_1.MoveResult.NoPath) {
                    this.log.info("Unable to find a path back to the base");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === ITars_1.MoveResult.Complete) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
            });
        }
    }
    exports.default = ReturnToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV0dXJuVG9CYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUmV0dXJuVG9CYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBTUEsa0JBQWtDLFNBQVEsbUJBQVM7UUFFckMsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjs7Z0JBQzdELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksWUFBWSxLQUFLLFdBQVcsSUFBSSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFO29CQUM3RixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsTUFBTSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO29CQUN4RCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUVoQztnQkFFRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7WUFDRixDQUFDO1NBQUE7S0FFRDtJQXBCRCwrQkFvQkMifQ==
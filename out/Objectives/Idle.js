var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../Objective", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, IAction_1, Objective_1, Movement_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Idle extends Objective_1.default {
        constructor(move = true) {
            super();
            this.move = move;
        }
        getHashCode() {
            return "Idle";
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.move) {
                    const moveResult = yield Movement_1.findAndMoveToTarget((point, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad);
                    if (moveResult !== Movement_1.MoveResult.Complete) {
                        this.log.info("Moving to idle position");
                        return;
                    }
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.Idle, action => action.execute(localPlayer));
            });
        }
    }
    exports.default = Idle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFMUMsWUFBNkIsT0FBZ0IsSUFBSTtZQUNoRCxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUVqRCxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFWSxTQUFTOztnQkFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNkLE1BQU0sVUFBVSxHQUFHLE1BQU0sOEJBQW1CLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JMLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUN6QyxPQUFPO3FCQUNQO2lCQUNEO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7U0FBQTtLQUVEO0lBdEJELHVCQXNCQyJ9
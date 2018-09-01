var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Objective", "./ExecuteAction", "../Utilities/Movement"], function (require, exports, Enums_1, Objective_1, ExecuteAction_1, Movement_1) {
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
                return new ExecuteAction_1.default(Enums_1.ActionType.Idle);
            });
        }
    }
    exports.default = Idle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFMUMsWUFBb0IsT0FBZ0IsSUFBSTtZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURXLFNBQUksR0FBSixJQUFJLENBQWdCO1FBRXhDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVZLFNBQVM7O2dCQUNyQixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ2QsTUFBTSxVQUFVLEdBQUcsTUFBTSw4QkFBbUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDckwsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7d0JBQ3pDLE9BQU87cUJBQ1A7aUJBQ0Q7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxDQUFDO1NBQUE7S0FFRDtJQXRCRCx1QkFzQkMifQ==
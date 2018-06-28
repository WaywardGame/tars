var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Helpers", "../ITars", "../Objective", "./ExecuteAction"], function (require, exports, Enums_1, Helpers, ITars_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Idle extends Objective_1.default {
        constructor(move = true) {
            super();
            this.move = move;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.move) {
                    const moveResult = yield Helpers.findAndMoveToTarget((point, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, true);
                    if (moveResult !== ITars_1.MoveResult.Complete) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0lkbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxVQUEwQixTQUFRLG1CQUFTO1FBRTFDLFlBQW9CLE9BQWdCLElBQUk7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUV4QyxDQUFDO1FBRVksU0FBUzs7Z0JBQ3JCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDZCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQWUsRUFBRSxJQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ25NLElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3dCQUN6QyxPQUFPO3FCQUNQO2lCQUNEO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsQ0FBQztTQUFBO0tBRUQ7SUFsQkQsdUJBa0JDIn0=
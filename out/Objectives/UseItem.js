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
    class UseItem extends Objective_1.default {
        constructor(item, useActionType, target) {
            super();
            this.item = item;
            this.useActionType = useActionType;
            this.target = target;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.target) {
                    if (calculateDifficulty) {
                        return Helpers.calculateDifficultyMoveToTarget(this.target);
                    }
                    const moveResult = yield Helpers.moveToTarget(this.target);
                    if (moveResult === ITars_1.MoveResult.NoPath) {
                        this.log.info("No path for use item target");
                        return;
                    }
                    if (moveResult !== ITars_1.MoveResult.Complete) {
                        return;
                    }
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.UseItem, {
                    item: this.item,
                    useActionType: this.useActionType
                });
            });
        }
    }
    exports.default = UseItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxhQUE2QixTQUFRLG1CQUFTO1FBRTdDLFlBQW9CLElBQVcsRUFBVSxhQUF5QixFQUFVLE1BQWlCO1lBQzVGLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztZQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFZO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUU3RixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyxPQUFPLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUM1RDtvQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMzRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQzt3QkFDN0MsT0FBTztxQkFDUDtvQkFFRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDdkMsT0FBTztxQkFDUDtpQkFDRDtnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLE9BQU8sRUFBRTtvQkFDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDakMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBRUQ7SUE3QkQsMEJBNkJDIn0=
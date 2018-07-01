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
                        return (yield Helpers.getMovementPath(this.target)).difficulty;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxhQUE2QixTQUFRLG1CQUFTO1FBRTdDLFlBQW9CLElBQVcsRUFBVSxhQUF5QixFQUFVLE1BQWlCO1lBQzVGLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztZQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFZO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUU3RixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQy9EO29CQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzNELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsTUFBTSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO3dCQUM3QyxPQUFPO3FCQUNQO29CQUVELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxPQUFPO3FCQUNQO2lCQUNEO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsT0FBTyxFQUFFO29CQUM1QyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2lCQUNqQyxDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FFRDtJQTdCRCwwQkE2QkMifQ==
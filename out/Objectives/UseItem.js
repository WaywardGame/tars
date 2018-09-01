var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./ExecuteAction", "../Utilities/Movement"], function (require, exports, Enums_1, IObjective_1, Objective_1, ExecuteAction_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseItem extends Objective_1.default {
        constructor(item, useActionType, target) {
            super();
            this.item = item;
            this.useActionType = useActionType;
            this.target = target;
        }
        getHashCode() {
            return `UseItem:${game.getName(this.item, Enums_1.SentenceCaseStyle.Title, false)}|${Enums_1.ActionType[this.useActionType]}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.target) {
                    if (calculateDifficulty) {
                        return (yield Movement_1.getMovementPath(this.target, true)).difficulty;
                    }
                    const moveResult = yield Movement_1.moveToFaceTarget(this.target);
                    if (moveResult === Movement_1.MoveResult.NoPath) {
                        this.log.info("No path for use item target");
                        return;
                    }
                    if (moveResult !== Movement_1.MoveResult.Complete) {
                        return;
                    }
                }
                if (this.item === undefined) {
                    this.log.error("Invalid item");
                    return IObjective_1.ObjectiveStatus.Complete;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBb0IsSUFBdUIsRUFBVSxhQUF5QixFQUFVLE1BQWlCO1lBQ3hHLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBbUI7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBWTtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVc7UUFFekcsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx5QkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksa0JBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUMvRyxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyxDQUFDLE1BQU0sMEJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO3FCQUM3RDtvQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7d0JBQzdDLE9BQU87cUJBQ1A7b0JBRUQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQ3ZDLE9BQU87cUJBQ1A7aUJBQ0Q7Z0JBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsT0FBTyxFQUFFO29CQUM1QyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2lCQUNqQyxDQUFDLENBQUM7WUFDSixDQUFDO1NBQUE7S0FFRDtJQXRDRCwwQkFzQ0MifQ==
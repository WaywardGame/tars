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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxhQUE2QixTQUFRLG1CQUFTO1FBRTdDLFlBQW9CLElBQXVCLEVBQVUsYUFBeUIsRUFBVSxNQUFpQjtZQUN4RyxLQUFLLEVBQUUsQ0FBQztZQURXLFNBQUksR0FBSixJQUFJLENBQW1CO1lBQVUsa0JBQWEsR0FBYixhQUFhLENBQVk7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFXO1FBRXpHLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sV0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDL0csQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ2hCLElBQUksbUJBQW1CLEVBQUU7d0JBQ3hCLE9BQU8sQ0FBQyxNQUFNLDBCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztxQkFDN0Q7b0JBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3ZELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO3dCQUM3QyxPQUFPO3FCQUNQO29CQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxPQUFPO3FCQUNQO2lCQUNEO2dCQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMvQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLE9BQU8sRUFBRTtvQkFDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDakMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBRUQ7SUF0Q0QsMEJBc0NDIn0=
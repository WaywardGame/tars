var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "../Utilities/Action"], function (require, exports, Enums_1, IObjective_1, Objective_1, Action_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExecuteAction extends Objective_1.default {
        constructor(actionType, executeArgument, complete = true) {
            super();
            this.actionType = actionType;
            this.executeArgument = executeArgument;
            this.complete = complete;
        }
        getHashCode() {
            return `ExecuteAction:${Enums_1.ActionType[this.actionType]}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (calculateDifficulty) {
                    return 0;
                }
                yield Action_1.executeAction(this.actionType, this.executeArgument);
                if (this.complete) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
            });
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0V4ZWN1dGVBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFPQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBb0IsVUFBc0IsRUFBVSxlQUFpQyxFQUFVLFdBQW9CLElBQUk7WUFDdEgsS0FBSyxFQUFFLENBQUM7WUFEVyxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFFdkgsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxpQkFBaUIsa0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE9BQU8sQ0FBQyxDQUFDO2lCQUNUO2dCQUVELE1BQU0sc0JBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFM0QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNsQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztZQUNGLENBQUM7U0FBQTtLQUVEO0lBdEJELGdDQXNCQyJ9
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../Objective", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, IAction_1, IObjective_1, Objective_1, Movement_1, ExecuteAction_1) {
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
            return `UseItem:${this.item && this.item.getName(false).getString()}|${IAction_1.ActionType[this.useActionType]}`;
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
                return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, action => action.execute(localPlayer, this.item, this.useActionType));
            });
        }
    }
    exports.default = UseItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsSUFBdUIsRUFBbUIsYUFBeUIsRUFBbUIsTUFBaUI7WUFDbkksS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBbUI7WUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQVk7WUFBbUIsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUVwSSxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLFdBQVcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ3pHLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNoQixJQUFJLG1CQUFtQixFQUFFO3dCQUN4QixPQUFPLENBQUMsTUFBTSwwQkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQzdEO29CQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN2RCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQzt3QkFDN0MsT0FBTztxQkFDUDtvQkFFRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDdkMsT0FBTztxQkFDUDtpQkFDRDtnQkFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0IsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JILENBQUM7U0FBQTtLQUVEO0lBbkNELDBCQW1DQyJ9
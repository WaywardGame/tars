define(["require", "exports", "game/entity/action/IAction", "../../../IContext", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction", "../../core/MoveToTarget"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItemIntoInventory extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `MoveItemIntoInventory:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Moving ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()} into inventory`;
        }
        async execute(context) {
            var _a;
            const item = (_a = this.item) !== null && _a !== void 0 ? _a : context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (itemManager.isContainableInContainer(item, context.player.inventory)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const point = item.getPoint();
            if (!point) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(point, true),
                new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                    action.execute(context.player, item, context.player.inventory);
                }),
            ];
        }
    }
    exports.default = MoveItemIntoInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW1JbnRvSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9Nb3ZlSXRlbUludG9JbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsSUFBVztZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8seUJBQXlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU0sU0FBUzs7WUFDWixPQUFPLFVBQVUsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUM7UUFDM0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLE1BQU0sSUFBSSxHQUFHLE1BQUEsSUFBSSxDQUFDLElBQUksbUNBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxXQUFXLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDbkM7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDUixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsT0FBTztnQkFDSCxJQUFJLHNCQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztnQkFDN0IsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN2RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQzthQUNMLENBQUM7UUFDTixDQUFDO0tBRUo7SUFyQ0Qsd0NBcUNDIn0=
define(["require", "exports", "game/entity/action/IAction", "game/doodad/Doodad", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Lambda"], function (require, exports, IAction_1, Doodad_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveItem extends Objective_1.default {
        constructor(item, targetContainer, source) {
            super();
            this.item = item;
            this.targetContainer = targetContainer;
            this.source = source;
        }
        getIdentifier() {
            return `MoveItem:${this.item}`;
        }
        getStatus() {
            if (Doodad_1.default.is(this.source)) {
                return `Moving ${this.item?.getName()} into the inventory from ${this.source.getName()}`;
            }
            return `Moving ${this.item?.getName()} into the inventory from (${this.source.x},${this.source.y},${this.source.z})`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid()) {
                this.log.warn(`Invalid move item ${item}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            return new Lambda_1.default(async (context) => {
                if (item.containedWithin === this.targetContainer) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                    action.execute(context.actionExecutor, item, this.targetContainer);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this);
            }).setStatus(this);
        }
    }
    exports.default = MoveItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL01vdmVJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLFFBQVMsU0FBUSxtQkFBUztRQUU5QyxZQUE2QixJQUFzQixFQUFtQixlQUEyQixFQUFtQixNQUF5QjtZQUM1SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUU3SSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2FBQ3pGO1lBRUQsT0FBTyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLDZCQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3RILENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE9BQU8sSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtnQkFDakMsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ2xELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNqRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDbkUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO0tBQ0Q7SUFwQ0QsMkJBb0NDIn0=
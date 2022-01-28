define(["require", "exports", "game/entity/action/IAction", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemForAction", "../../contextData/SetContextData", "../../core/ExecuteAction"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, AcquireItemForAction_1, SetContextData_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReinforceItem extends Objective_1.default {
        constructor(item, options = {}) {
            super();
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            return `ReinforceItem:${this.item}:${this.options.targetDurabilityMultipler}:${this.options.minWorth}`;
        }
        getStatus() {
            return `Reinforcing ${this.item.getName()}`;
        }
        async execute(context) {
            if (!this.item.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const minDur = this.item.minDur;
            const maxDur = this.item.maxDur;
            if (minDur === undefined || maxDur === undefined) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.minWorth !== undefined) {
                const worth = this.item.description()?.worth;
                if (worth === undefined || worth < this.options.minWorth) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            if (this.options.targetDurabilityMultipler !== undefined) {
                const defaultDurability = context.island.items.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
                if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);
            const objectives = [];
            const reinforceItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Reinforce);
            if (reinforceItems.length > 0) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, reinforceItems[0]));
            }
            else {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Reinforce).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Reinforce, (context, action) => {
                const reinforceItem = context.getData(IContext_1.ContextDataType.Item1);
                if (!reinforceItem) {
                    this.log.error("Invalid reinforce item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(context.player, reinforceItem, this.item);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vUmVpbmZvcmNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFpQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsVUFBNEUsRUFBRTtZQUN2SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXVFO1FBRXhJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUNqRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxDQUFDO2dCQUM3QyxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO29CQUN6RCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2lCQUM5QjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixLQUFLLFNBQVMsRUFBRTtnQkFDekQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM1SCxJQUFJLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO29CQUN6RSxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2lCQUM5QjthQUNEO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEcsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUU5RTtpQkFBTTtnQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQywwQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDekc7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDM0UsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwQixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFqRUQsZ0NBaUVDIn0=
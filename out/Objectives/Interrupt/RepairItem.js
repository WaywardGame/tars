define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/item/IItemManager", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItem", "../contextData/SetContextData", "../core/ExecuteAction", "../utility/CompleteRequirements"], function (require, exports, IAction_1, IItem_1, IItemManager_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, CompleteRequirements_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RepairItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `RepairItem:${this.item}`;
        }
        getStatus() {
            return `Repairing ${this.item.getName()}`;
        }
        async execute(context) {
            if (this.item === context.inventory.hammer) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.item.minDur === undefined || this.item.maxDur === undefined) {
                this.log.warn("Can't repair item, invalid durability", this.item);
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const description = this.item.description();
            if (!description || description.durability === undefined || description.repairable === false) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (context.player.isSwimming()) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            if (context.inventory.hammer) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, context.inventory.hammer));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHammer).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            const requirementInfo = context.island.items.hasAdditionalRequirements(context.player, this.item.type, undefined, undefined, true);
            if (requirementInfo.requirements === IItemManager_1.RequirementStatus.Missing) {
                this.log.info("Repair requirements not met");
                objectives.push(new CompleteRequirements_1.default(requirementInfo));
            }
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Repair, (context, action) => {
                const hammer = context.getData(IContext_1.ContextDataType.Item1);
                if (!hammer) {
                    this.log.error("Invalid hammer");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(context.player, hammer, this.item);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9SZXBhaXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFVBQVcsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixJQUFVO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdkMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUMzQyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxLQUFLLEVBQUU7Z0JBRTdGLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ2hDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUVyRjtpQkFBTTtnQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLDBCQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNoRztZQUVELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuSSxJQUFJLGVBQWUsQ0FBQyxZQUFZLEtBQUssZ0NBQWlCLENBQUMsT0FBTyxFQUFFO2dCQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUM3QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzthQUMzRDtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN4RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDakMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7Z0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEIsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBL0RELDZCQStEQyJ9
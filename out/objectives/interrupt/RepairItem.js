define(["require", "exports", "game/entity/action/actions/Repair", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireInventoryItem", "../core/ExecuteAction", "../utility/CompleteRequirements"], function (require, exports, Repair_1, IObjective_1, Objective_1, AcquireInventoryItem_1, ExecuteAction_1, CompleteRequirements_1) {
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
            if (this.item.durability === undefined || this.item.durabilityMax === undefined) {
                this.log.warn(`Can't repair item ${this.item}, invalid durability`);
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const description = this.item.description();
            if (!description || description.durability === undefined || description.repairable === false) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (context.human.isSwimming()) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            return [
                new AcquireInventoryItem_1.default("hammer"),
                new CompleteRequirements_1.default(context.island.items.hasAdditionalRequirements(context.human, this.item.type, undefined, true)),
                new ExecuteAction_1.default(Repair_1.default, (context) => {
                    const hammer = context.inventory.hammer;
                    if (!hammer) {
                        this.log.error("Invalid hammer");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return [hammer, this.item];
                }).setStatus(this),
            ];
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9SZXBhaXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLFVBQVcsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixJQUFVO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdkMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUMzQyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLElBQUksc0JBQXNCLENBQUMsQ0FBQztnQkFDcEUsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtnQkFFN0YsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDL0IsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE9BQU87Z0JBQ04sSUFBSSw4QkFBb0IsQ0FBQyxRQUFRLENBQUM7Z0JBQ2xDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hILElBQUksdUJBQWEsQ0FBQyxnQkFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO29CQUN4QyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBbUMsQ0FBQztnQkFDOUQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzthQUNsQixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBakRELDZCQWlEQyJ9
define(["require", "exports", "entity/action/IAction", "item/IItem", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Tile", "../Acquire/Item/AcquireItem", "../ContextData/CopyContextData", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Utility/CompleteRequirements"], function (require, exports, IAction_1, IItem_1, Context_1, IObjective_1, Objective_1, Tile_1, AcquireItem_1, CopyContextData_1, SetContextData_1, ExecuteAction_1, CompleteRequirements_1) {
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
        async execute(context) {
            var _a, _b;
            if (this.item.minDur === undefined || this.item.maxDur === undefined || this.item === context.inventory.hammer) {
                this.log.warn("can't repair item no dur", this.item);
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const description = this.item.description();
            if (!description || description.durability === undefined || description.repairable === false) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (Tile_1.isSwimming(context)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            if (context.inventory.hammer === undefined) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHammer));
                objectives.push(new CopyContextData_1.default(Context_1.ContextDataType.Item1, Context_1.ContextDataType.LastAcquiredItem));
            }
            else {
                objectives.push(new SetContextData_1.default(Context_1.ContextDataType.Item1, context.inventory.hammer));
            }
            const requirements = itemManager.hasAdditionalRequirements(context.player, this.item.type);
            if (!requirements.requirementsMet) {
                objectives.push(new CompleteRequirements_1.default((_a = description.recipe) === null || _a === void 0 ? void 0 : _a.requiredDoodad, (((_b = description.recipe) === null || _b === void 0 ? void 0 : _b.requiresFire) || description.repairAndDisassemblyRequiresFire) ? true : false));
            }
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Repair, (context, action) => {
                const hammer = context.getData(Context_1.ContextDataType.Item1);
                if (!hammer) {
                    this.log.error("Invalid hammer");
                    return;
                }
                action.execute(context.player, hammer, this.item);
            }));
            return objectives;
        }
    }
    exports.default = RepairItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9SZXBhaXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLFVBQVcsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixJQUFVO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdkMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9HLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtnQkFFN0YsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksaUJBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDeEIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQzNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFHdkQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHlCQUFlLENBQUMseUJBQWUsQ0FBQyxLQUFLLEVBQUUseUJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7YUFFOUY7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO1lBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRTtnQkFDbEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixPQUFDLFdBQVcsQ0FBQyxNQUFNLDBDQUFFLGNBQWMsRUFBRSxDQUFDLE9BQUEsV0FBVyxDQUFDLE1BQU0sMENBQUUsWUFBWSxLQUFJLFdBQVcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDakw7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDeEUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ2pDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXhERCw2QkF3REMifQ==
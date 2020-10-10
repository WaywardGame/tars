define(["require", "exports", "entity/action/IAction", "item/IItem", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Player", "../../Utilities/Tile", "../Acquire/Item/AcquireItem", "../ContextData/CopyContextData", "../ContextData/SetContextData", "../Core/ExecuteAction", "../Utility/CompleteRequirements"], function (require, exports, IAction_1, IItem_1, Context_1, IObjective_1, Objective_1, Player_1, Tile_1, AcquireItem_1, CopyContextData_1, SetContextData_1, ExecuteAction_1, CompleteRequirements_1) {
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
            if (Tile_1.isOverWater(context) && !Player_1.isUsingVehicle(context)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            if (context.inventory.hammer === undefined) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.StoneHammer));
                objectives.push(new CopyContextData_1.default(Context_1.ContextDataType.LastAcquiredItem, Context_1.ContextDataType.Item1));
            }
            else {
                objectives.push(new SetContextData_1.default(Context_1.ContextDataType.Item1, context.inventory.hammer));
            }
            const requirements = itemManager.hasAdditionalRequirements(context.player, this.item.type, undefined, undefined, true);
            if (!requirements.requirementsMet) {
                this.log.info("Repair requirements not met");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwYWlySXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0ludGVycnVwdC9SZXBhaXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFVBQVcsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixJQUFVO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdkMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUMzQyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxLQUFLLEVBQUU7Z0JBRTdGLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLGtCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUd2RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQWUsQ0FBQyx5QkFBZSxDQUFDLGdCQUFnQixFQUFFLHlCQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUU5RjtpQkFBTTtnQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyx5QkFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDckY7WUFFRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZILElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUM3QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLE9BQUMsV0FBVyxDQUFDLE1BQU0sMENBQUUsY0FBYyxFQUFFLENBQUMsT0FBQSxXQUFXLENBQUMsTUFBTSwwQ0FBRSxZQUFZLEtBQUksV0FBVyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNqTDtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN4RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHlCQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDakMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBN0RELDZCQTZEQyJ9
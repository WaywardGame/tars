define(["require", "exports", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../contextData/SetContextData", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemIntoInventory", "../other/item/PlantSeed"], function (require, exports, IContext_1, IObjective_1, Objective_1, SetContextData_1, ReserveItems_1, Restart_1, MoveItemIntoInventory_1, PlantSeed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeeds extends Objective_1.default {
        getIdentifier() {
            return "PlantSeeds";
        }
        getStatus() {
            return "Planting seeds";
        }
        async execute(context) {
            const seeds = context.utilities.item.getSeeds(context);
            if (seeds.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectivePipelines = [];
            for (const seed of seeds) {
                objectivePipelines.push([
                    new SetContextData_1.default(IContext_1.ContextDataType.DisableMoveAwayFromBaseItemOrganization, true),
                    new ReserveItems_1.default(seed),
                    new MoveItemIntoInventory_1.default(seed),
                    new PlantSeed_1.default(seed),
                    new Restart_1.default(),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = PlantSeeds;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvUGxhbnRTZWVkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFdEMsYUFBYTtZQUNoQixPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDakM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3RCLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFFcEIsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDO29CQUNqRixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDO29CQUN0QixJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQztvQkFDL0IsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQztvQkFDbkIsSUFBSSxpQkFBTyxFQUFFO2lCQUNoQixDQUFDLENBQUM7YUFDTjtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBaENELDZCQWdDQyJ9
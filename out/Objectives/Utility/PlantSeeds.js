define(["require", "exports", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Item", "../contextData/SetContextData", "../core/ReserveItems", "../core/Restart", "../other/item/MoveItemIntoInventory", "../other/item/PlantSeed"], function (require, exports, IContext_1, IObjective_1, Objective_1, Item_1, SetContextData_1, ReserveItems_1, Restart_1, MoveItemIntoInventory_1, PlantSeed_1) {
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
            const seeds = Item_1.itemUtilities.getSeeds(context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvUGxhbnRTZWVkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFdEMsYUFBYTtZQUNoQixPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxLQUFLLEdBQUcsb0JBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUNqQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDdEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUVwQixJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUM7b0JBQ2pGLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDO29CQUMvQixJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDO29CQUNuQixJQUFJLGlCQUFPLEVBQUU7aUJBQ2hCLENBQUMsQ0FBQzthQUNOO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUFoQ0QsNkJBZ0NDIn0=
define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "utilities/math/Vector2", "../../Context", "../../IObjective", "../../Objective", "../Acquire/Item/AcquireItemForDoodad", "../Analyze/AnalyzeBase", "../Core/ExecuteAction", "../Core/MoveToTarget", "../Other/BuildItem"], function (require, exports, IDoodad_1, IAction_1, Vector2_1, Context_1, IObjective_1, Objective_1, AcquireItemForDoodad_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, BuildItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveIntoChest extends Objective_1.default {
        constructor(itemsToMove, maxChestDistance) {
            super();
            this.itemsToMove = itemsToMove;
            this.maxChestDistance = maxChestDistance;
        }
        getIdentifier() {
            return `MoveIntoChest:${this.itemsToMove ? this.itemsToMove.join(", ") : undefined}`;
        }
        async execute(context) {
            const itemsToMove = this.itemsToMove || [context.getData(Context_1.ContextDataType.LastAcquiredItem)];
            const firstItem = itemsToMove[0];
            if (!firstItem) {
                this.log.error("Invalid item to move");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            const chests = context.base.chest
                .sort((a, b) => itemManager.computeContainerWeight(a) > itemManager.computeContainerWeight(b) ? 1 : -1);
            for (const chest of chests) {
                if (this.maxChestDistance !== undefined && Vector2_1.default.distance(context.player, chest) > this.maxChestDistance) {
                    continue;
                }
                const targetContainer = chest;
                const weight = itemManager.computeContainerWeight(targetContainer);
                if (weight + firstItem.getTotalWeight() <= targetContainer.weightCapacity) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(chest, true));
                    for (const item of itemsToMove) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, targetContainer);
                        }));
                    }
                    objectivePipelines.push(objectives);
                }
            }
            if (objectivePipelines.length === 0) {
                this.log.info("Build another chest");
                objectivePipelines.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadType.WoodenChest), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveIntoChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUludG9DaGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1V0aWxpdHkvTW92ZUludG9DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsV0FBb0IsRUFBbUIsZ0JBQXlCO1lBQzVGLEtBQUssRUFBRSxDQUFDO1lBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1lBQW1CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUztRQUU3RixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDNUYsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdkMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7aUJBQy9CLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNySSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDM0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxJQUFJLGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUMzRyxTQUFTO2lCQUNUO2dCQUVELE1BQU0sZUFBZSxHQUFHLEtBQW1CLENBQUM7Z0JBQzVDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLGVBQWUsQ0FBQyxjQUFlLEVBQUU7b0JBRTNFLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUUvQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTt3QkFDL0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQzFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7d0JBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ0o7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwQzthQUNEO1lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUVyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxtQkFBUyxFQUFFLEVBQUUsSUFBSSxxQkFBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2hIO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUFyREQsZ0NBcURDIn0=
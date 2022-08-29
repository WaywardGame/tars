define(["require", "exports", "../../../core/objective/Objective", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource"], function (require, exports, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        getExecutionPriority(context, tree) {
            const result = {
                priority: 0,
                objectiveCount: 0,
                acquireObjectiveCount: 0,
                gatherObjectiveCount: 0,
                chestGatherObjectiveCount: 0,
                craftsRequiringNoGatheringCount: 0,
            };
            const children = tree.groupedAway ? tree.groupedAway.children : tree.children;
            const isAcquireObjective = tree.objective instanceof AcquireBase;
            if (isAcquireObjective) {
                result.acquireObjectiveCount++;
                for (const child of children) {
                    this.addGatherObjectivePriorities(result, child);
                    this.addAcquireObjectivePriorities(result, child);
                }
            }
            for (const child of children) {
                result.objectiveCount++;
                const childResult = this.getExecutionPriority(context, child);
                this.addResult(childResult, result);
            }
            if (isAcquireObjective) {
                const objectiveName = tree.objective.getName();
                if (objectiveName === "AcquireItemWithRecipe") {
                    const nonChestGatherObjectives = result.gatherObjectiveCount - result.chestGatherObjectiveCount;
                    result.priority = nonChestGatherObjectives * 50000;
                }
            }
            return result;
        }
        addResult(source, destination) {
            for (const key of Object.keys(source)) {
                destination[key] += source[key];
            }
        }
        addGatherObjectivePriorities(result, tree) {
            if (tree.objective instanceof GatherFromCreature_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 700;
            }
            else if (tree.objective instanceof GatherFromCorpse_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 600;
            }
            else if (tree.objective instanceof GatherFromGround_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 500;
            }
            else if (tree.objective instanceof GatherFromTerrainResource_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 200;
            }
            else if (tree.objective instanceof GatherFromDoodad_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 200;
            }
            else if (tree.objective instanceof GatherFromChest_1.default) {
                result.gatherObjectiveCount++;
                result.chestGatherObjectiveCount++;
                result.priority += 20;
            }
        }
        addAcquireObjectivePriorities(result, tree) {
            if (tree.objective.getName() === "AcquireItemFromDisassemble") {
                result.priority += 100000;
            }
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUNBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQXVCbkQsb0JBQW9CLENBQUMsT0FBZ0IsRUFBRSxJQUFvQjtZQUNqRSxNQUFNLE1BQU0sR0FBdUI7Z0JBQ2xDLFFBQVEsRUFBRSxDQUFDO2dCQUNYLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixxQkFBcUIsRUFBRSxDQUFDO2dCQUV4QixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2Qix5QkFBeUIsRUFBRSxDQUFDO2dCQUM1QiwrQkFBK0IsRUFBRSxDQUFDO2FBRWxDLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLFlBQVksV0FBVyxDQUFDO1lBQ2pFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUUvQixLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDbEQ7YUFDRDtZQUVELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO2dCQUM3QixNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXhCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3BDO1lBT0QsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdkIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFL0MsSUFBSSxhQUFhLEtBQUssdUJBQXVCLEVBQUU7b0JBQzlDLE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztvQkFHaEcsTUFBTSxDQUFDLFFBQVEsR0FBRyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7aUJBd0NuRDthQUNEO1lBTUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sU0FBUyxDQUFDLE1BQTBCLEVBQUUsV0FBK0I7WUFDNUUsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBb0MsRUFBRTtnQkFDekUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoQztRQUNGLENBQUM7UUFLTyw0QkFBNEIsQ0FBQyxNQUEwQixFQUFFLElBQW9CO1lBQ3BGLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsRUFBRTtnQkFDakQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDO2FBRXZCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDO2FBRXZCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFFdEQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDO2FBRXZCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSxtQ0FBeUIsRUFBRTtnQkFDL0QsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDO2FBRXZCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDO2FBRXZCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSx5QkFBZSxFQUFFO2dCQUVyRCxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztRQUtPLDZCQUE2QixDQUFDLE1BQTBCLEVBQUUsSUFBb0I7WUFDckYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLDRCQUE0QixFQUFFO2dCQUk5RCxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQzthQUMxQjtRQUNGLENBQUM7S0FFRDtJQXZLRCw4QkF1S0MifQ==
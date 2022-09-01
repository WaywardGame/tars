define(["require", "exports", "../../../core/objective/Objective", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource"], function (require, exports, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        getExecutionPriority(context, tree) {
            const result = {
                totalGatherObjectives: 0,
                totalCraftObjectives: 0,
                readyToCraftObjectives: 0,
                gatherObjectives: {
                    GatherFromChest: 0,
                    GatherFromCorpse: 0,
                    GatherFromCreature: 0,
                    GatherFromDoodad: 0,
                    GatherFromGround: 0,
                    GatherFromTerrainResource: 0,
                },
            };
            const children = tree.groupedAway ? tree.groupedAway.children : tree.children;
            const isAcquireObjective = tree.objective instanceof AcquireBase;
            if (isAcquireObjective) {
                for (const child of children) {
                    this.addGatherObjectivePriorities(result, child);
                    this.addAcquireObjectivePriorities(result, child);
                }
            }
            for (const child of children) {
                const childResult = this.getExecutionPriority(context, child);
                this.addResult(childResult, result);
            }
            if (isAcquireObjective) {
                const objectiveName = tree.objective.getName();
                if (objectiveName === "AcquireItemWithRecipe") {
                    result.totalCraftObjectives++;
                    if (result.totalGatherObjectives === 0) {
                        result.readyToCraftObjectives++;
                    }
                }
            }
            return result;
        }
        addResult(source, destination) {
            for (const key of Object.keys(source)) {
                if (typeof (source[key]) === "number") {
                    destination[key] += source[key];
                }
                else {
                    for (const key2 of Object.keys(source[key])) {
                        destination[key][key2] += source[key][key2];
                    }
                }
            }
        }
        addGatherObjectivePriorities(result, tree) {
            if (tree.objective instanceof GatherFromCreature_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromCreature++;
            }
            else if (tree.objective instanceof GatherFromCorpse_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromCorpse++;
            }
            else if (tree.objective instanceof GatherFromGround_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromGround++;
            }
            else if (tree.objective instanceof GatherFromTerrainResource_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromTerrainResource++;
            }
            else if (tree.objective instanceof GatherFromDoodad_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromDoodad++;
            }
            else if (tree.objective instanceof GatherFromChest_1.default) {
                result.totalGatherObjectives++;
                result.gatherObjectives.GatherFromChest++;
            }
        }
        addAcquireObjectivePriorities(result, tree) {
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUNBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQVFuRCxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLElBQW9CO1lBQ2pFLE1BQU0sTUFBTSxHQUF1QjtnQkFDbEMscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekIsZ0JBQWdCLEVBQUU7b0JBQ2pCLGVBQWUsRUFBRSxDQUFDO29CQUNsQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQix5QkFBeUIsRUFBRSxDQUFDO2lCQUM1QjthQUNELENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLFlBQVksV0FBVyxDQUFDO1lBQ2pFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO29CQUM3QixJQUFJLENBQUMsNEJBQTRCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNsRDthQUNEO1lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUU7Z0JBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdkIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFL0MsSUFBSSxhQUFhLEtBQUssdUJBQXVCLEVBQUU7b0JBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO29CQUU5QixJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsS0FBSyxDQUFDLEVBQUU7d0JBR3ZDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO3FCQUNoQztpQkFDRDthQUNEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sU0FBUyxDQUFDLE1BQTBCLEVBQUUsV0FBK0I7WUFDNUUsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBb0MsRUFBRTtnQkFDekUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNyQyxXQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQVcsQ0FBQztpQkFFbkQ7cUJBQU07b0JBQ04sS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO3dCQUMzQyxXQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLE1BQU0sQ0FBQyxHQUFHLENBQVMsQ0FBQyxJQUFJLENBQVcsQ0FBQztxQkFDeEU7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFLTyw0QkFBNEIsQ0FBQyxNQUEwQixFQUFFLElBQW9CO1lBQ3BGLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsRUFBRTtnQkFDakQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBRTdDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBRTNDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFFdEQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBRTNDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSxtQ0FBeUIsRUFBRTtnQkFDL0QsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2FBRXBEO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBRTNDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSx5QkFBZSxFQUFFO2dCQUVyRCxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUtPLDZCQUE2QixDQUFDLE1BQTBCLEVBQUUsSUFBb0I7UUFRdEYsQ0FBQztLQUVEO0lBakhELDhCQWlIQyJ9
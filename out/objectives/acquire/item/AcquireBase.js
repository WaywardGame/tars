define(["require", "exports", "../../../core/objective/Objective", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource"], function (require, exports, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        getExecutionPriority(context, tree) {
            const result = {
                gatherObjectives: 0,
                craftObjectives: 0,
                gatherFromCreatureObjectives: 0,
                gatherFromChestObjectives: 0,
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
                    result.craftObjectives++;
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
                result.gatherObjectives++;
                result.gatherFromCreatureObjectives++;
            }
            else if (tree.objective instanceof GatherFromCorpse_1.default) {
                result.gatherObjectives++;
            }
            else if (tree.objective instanceof GatherFromGround_1.default) {
                result.gatherObjectives++;
            }
            else if (tree.objective instanceof GatherFromTerrainResource_1.default) {
                result.gatherObjectives++;
            }
            else if (tree.objective instanceof GatherFromDoodad_1.default) {
                result.gatherObjectives++;
            }
            else if (tree.objective instanceof GatherFromChest_1.default) {
                result.gatherObjectives++;
                result.gatherFromChestObjectives++;
            }
        }
        addAcquireObjectivePriorities(result, tree) {
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUNBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQVFuRCxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLElBQW9CO1lBQ2pFLE1BQU0sTUFBTSxHQUF1QjtnQkFDbEMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbkIsZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLDRCQUE0QixFQUFFLENBQUM7Z0JBQy9CLHlCQUF5QixFQUFFLENBQUM7YUFDNUIsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRTlFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsWUFBWSxXQUFXLENBQUM7WUFDakUsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdkIsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUU7b0JBQzdCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ2xEO2FBQ0Q7WUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRTtnQkFDN0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDcEM7WUFFRCxJQUFJLGtCQUFrQixFQUFFO2dCQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUUvQyxJQUFJLGFBQWEsS0FBSyx1QkFBdUIsRUFBRTtvQkFDOUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2lCQUN6QjthQUNEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sU0FBUyxDQUFDLE1BQTBCLEVBQUUsV0FBK0I7WUFDNUUsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBb0MsRUFBRTtnQkFDekUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoQztRQUNGLENBQUM7UUFLTyw0QkFBNEIsQ0FBQyxNQUEwQixFQUFFLElBQW9CO1lBQ3BGLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsRUFBRTtnQkFDakQsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2FBRXRDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7YUFFMUI7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLDBCQUFnQixFQUFFO2dCQUV0RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUUxQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksbUNBQXlCLEVBQUU7Z0JBQy9ELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBRTFCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSwwQkFBZ0IsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7YUFFMUI7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLHlCQUFlLEVBQUU7Z0JBRXJELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMxQixNQUFNLENBQUMseUJBQXlCLEVBQUUsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFLTyw2QkFBNkIsQ0FBQyxNQUEwQixFQUFFLElBQW9CO1FBUXRGLENBQUM7S0FFRDtJQXpGRCw4QkF5RkMifQ==
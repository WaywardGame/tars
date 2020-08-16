define(["require", "exports", "../../../Objective", "../../../Utilities/Base", "../../Gather/GatherFromChest", "../../Gather/GatherFromCorpse", "../../Gather/GatherFromCreature", "../../Gather/GatherFromDoodad", "../../Gather/GatherFromGround", "../../Gather/GatherFromTerrain"], function (require, exports, Objective_1, Base_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        sort(context, executionTreeA, executionTreeB) {
            const priorityA = this.calculatePriority(context, executionTreeA);
            const priorityB = this.calculatePriority(context, executionTreeB);
            return priorityA.priority === priorityB.priority ? 0 : priorityA.priority < priorityB.priority ? 1 : -1;
        }
        calculatePriority(context, tree) {
            const result = {
                priority: 0,
                objectiveCount: 0,
                acquireObjectiveCount: 0,
                emptyAcquireObjectiveCount: 0,
                gatherObjectiveCount: 0,
                gatherWithoutChestObjectiveCount: 0,
                craftsRequiringNoGatheringCount: 0,
            };
            const isAcquireObjective = tree.objective instanceof AcquireBase;
            if (isAcquireObjective) {
                result.acquireObjectiveCount++;
                for (const child of tree.children) {
                    this.addGatherObjectivePriorities(result, child);
                }
            }
            for (const child of tree.children) {
                result.objectiveCount++;
                const childResult = this.calculatePriority(context, child);
                this.addResult(childResult, result);
            }
            if (isAcquireObjective && tree.children.length === 0) {
                result.emptyAcquireObjectiveCount++;
            }
            if (isAcquireObjective && tree.objective.getName() === "AcquireItemWithRecipe" && result.gatherObjectiveCount === 0) {
                if (result.emptyAcquireObjectiveCount === 0) {
                    if (Base_1.isNearBase(context)) {
                        result.priority += 50000;
                        result.craftsRequiringNoGatheringCount++;
                    }
                }
                else {
                    result.priority -= 50000;
                }
            }
            return result;
        }
        addResult(source, destination) {
            destination.priority += source.priority;
            destination.objectiveCount += source.objectiveCount;
            destination.acquireObjectiveCount += source.acquireObjectiveCount;
            destination.emptyAcquireObjectiveCount += source.emptyAcquireObjectiveCount;
            destination.gatherObjectiveCount += source.gatherObjectiveCount;
            destination.gatherWithoutChestObjectiveCount += source.gatherWithoutChestObjectiveCount;
            destination.craftsRequiringNoGatheringCount += source.craftsRequiringNoGatheringCount;
        }
        addGatherObjectivePriorities(result, tree) {
            if (tree.objective instanceof GatherFromCreature_1.default) {
                result.gatherObjectiveCount++;
                result.gatherWithoutChestObjectiveCount++;
                result.priority += 700;
            }
            else if (tree.objective instanceof GatherFromCorpse_1.default) {
                result.gatherObjectiveCount++;
                result.gatherWithoutChestObjectiveCount++;
                result.priority += 600;
            }
            else if (tree.objective instanceof GatherFromGround_1.default) {
                result.gatherObjectiveCount++;
                result.gatherWithoutChestObjectiveCount++;
                result.priority += 500;
            }
            else if (tree.objective instanceof GatherFromTerrain_1.default) {
                result.gatherObjectiveCount++;
                result.gatherWithoutChestObjectiveCount++;
                result.priority += 200;
            }
            else if (tree.objective instanceof GatherFromDoodad_1.default) {
                result.gatherObjectiveCount++;
                result.gatherWithoutChestObjectiveCount++;
                result.priority += 200;
            }
            else if (tree.objective instanceof GatherFromChest_1.default) {
                result.gatherObjectiveCount++;
                result.priority += 20;
            }
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlL0l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQU9uRCxJQUFJLENBQUMsT0FBZ0IsRUFBRSxjQUFtQyxFQUFFLGNBQW1DO1lBQ3JHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUtsRSxPQUFPLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUVNLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsSUFBb0I7WUFDOUQsTUFBTSxNQUFNLEdBQXVCO2dCQUNsQyxRQUFRLEVBQUUsQ0FBQztnQkFDWCxjQUFjLEVBQUUsQ0FBQztnQkFDakIscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsMEJBQTBCLEVBQUUsQ0FBQztnQkFDN0Isb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsZ0NBQWdDLEVBQUUsQ0FBQztnQkFDbkMsK0JBQStCLEVBQUUsQ0FBQzthQUNsQyxDQUFDO1lBRUYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxZQUFZLFdBQVcsQ0FBQztZQUNqRSxJQUFJLGtCQUFrQixFQUFFO2dCQUN2QixNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFFL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxJ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
define(["require", "exports", "../../../Objective", "../../../utilities/Base", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrain"], function (require, exports, Objective_1, Base_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
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
                    this.addAcquireObjectivePriorities(result, child);
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
            if (isAcquireObjective) {
                const objectiveName = tree.objective.getName();
                if (objectiveName === "AcquireItemWithRecipe" && result.gatherWithoutChestObjectiveCount === 0) {
                    if (result.emptyAcquireObjectiveCount === 0 || (result.gatherWithoutChestObjectiveCount === 0 && result.gatherObjectiveCount > 0)) {
                        if (Base_1.baseUtilities.isNearBase(context)) {
                            result.priority += 50000;
                            result.priority += result.gatherObjectiveCount * -20;
                            result.craftsRequiringNoGatheringCount++;
                        }
                    }
                    else {
                        result.priority -= 50000;
                    }
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
        addAcquireObjectivePriorities(result, tree) {
            if (tree.objective.getName() === "AcquireItemFromDisassemble") {
                result.priority += 100000;
            }
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQU9uRCxJQUFJLENBQUMsT0FBZ0IsRUFBRSxjQUFtQyxFQUFFLGNBQW1DO1lBQ3JHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUtsRSxPQUFPLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUtNLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsSUFBb0I7WUFDOUQsTUFBTSxNQUFNLEdBQXVCO2dCQUNsQyxRQUFRLEVBQUUsQ0FBQztnQkFDWCxjQUFjLEVBQUUsQ0FBQztnQkFDakIscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsMEJBQTBCLEVBQUUsQ0FBQztnQkFDN0Isb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsZ0NBQWdDLEVBQUUsQ0FBQztnQkFDbkMsK0JBQStCLEVBQUUsQ0FBQzthQUNsQyxDQUFDO1lBRUYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxZQUFZLFdBQVcsQ0FBQztZQUNqRSxJQUFJLGtCQUFrQixFQUFFO2dCQUN2QixNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFFL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxJ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
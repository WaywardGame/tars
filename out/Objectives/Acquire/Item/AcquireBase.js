define(["require", "exports", "../../../core/objective/Objective", "../../../utilities/Base", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrain"], function (require, exports, Objective_1, Base_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
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
                regroupedChildrenCount: 0,
            };
            if (tree.groupedAway) {
                result.regroupedChildrenCount++;
            }
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
                    if (result.regroupedChildrenCount === 0 && (result.emptyAcquireObjectiveCount === 0 || (result.gatherWithoutChestObjectiveCount === 0 && result.gatherObjectiveCount > 0))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBbUNBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQU9uRCxJQUFJLENBQUMsT0FBZ0IsRUFBRSxjQUFtQyxFQUFFLGNBQW1DO1lBQ3JHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUtsRSxPQUFPLFNBQVMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUtNLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsSUFBb0I7WUFDOUQsTUFBTSxNQUFNLEdBQXVCO2dCQUNsQyxRQUFRLEVBQUUsQ0FBQztnQkFDWCxjQUFjLEVBQUUsQ0FBQztnQkFDakIscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsMEJBQTBCLEVBQUUsQ0FBQztnQkFDN0Isb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsZ0NBQWdDLEVBQUUsQ0FBQztnQkFDbkMsK0JBQStCLEVBQUUsQ0FBQztnQkFDbEMsc0JBQXNCLEVBQUUsQ0FBQzthQUN6QixDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUNoQztZQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsWUFBWSxX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
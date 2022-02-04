define(["require", "exports", "../../../core/objective/Objective", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrain"], function (require, exports, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        getExecutionPriority(context, tree) {
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
                const childResult = this.getExecutionPriority(context, child);
                this.addResult(childResult, result);
            }
            if (isAcquireObjective && tree.children.length === 0) {
                result.emptyAcquireObjectiveCount++;
            }
            if (isAcquireObjective) {
                const objectiveName = tree.objective.getName();
                if (objectiveName === "AcquireItemWithRecipe" && result.gatherWithoutChestObjectiveCount === 0) {
                    if (result.regroupedChildrenCount === 0 && (result.emptyAcquireObjectiveCount === 0 || (result.gatherWithoutChestObjectiveCount === 0 && result.gatherObjectiveCount > 0))) {
                        if (context.utilities.base.isNearBase(context)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQXVCbkQsb0JBQW9CLENBQUMsT0FBZ0IsRUFBRSxJQUFvQjtZQUNqRSxNQUFNLE1BQU0sR0FBdUI7Z0JBQ2xDLFFBQVEsRUFBRSxDQUFDO2dCQUNYLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixxQkFBcUIsRUFBRSxDQUFDO2dCQUN4QiwwQkFBMEIsRUFBRSxDQUFDO2dCQUM3QixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixnQ0FBZ0MsRUFBRSxDQUFDO2dCQUNuQywrQkFBK0IsRUFBRSxDQUFDO2dCQUNsQyxzQkFBc0IsRUFBRSxDQUFDO2FBQ3pCLENBQUM7WUFFRixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxZQUFZLFdBQVcsQ0FBQztZQUNqRSxJQUFJLGtCQUFrQixFQUFFO2dCQUN2QixNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFFL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNsQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNsRDthQUNEO1lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXhCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxP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
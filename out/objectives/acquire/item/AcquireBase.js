define(["require", "exports", "../../../core/objective/Objective", "../../gather/GatherFromChest", "../../gather/GatherFromCorpse", "../../gather/GatherFromCreature", "../../gather/GatherFromDoodad", "../../gather/GatherFromGround", "../../gather/GatherFromTerrainResource"], function (require, exports, Objective_1, GatherFromChest_1, GatherFromCorpse_1, GatherFromCreature_1, GatherFromDoodad_1, GatherFromGround_1, GatherFromTerrainResource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBase extends Objective_1.default {
        getExecutionPriority(context, tree) {
            const result = {
                totalGatherObjectives: 0,
                totalCraftObjectives: 0,
                readyToCraftObjectives: 0,
                useProvidedItemObjectives: 0,
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
                    if (result.totalGatherObjectives === 0 && result.useProvidedItemObjectives === 0) {
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
            if (tree.objective.getName() === "UseProvidedItem") {
                result.useProvidedItemObjectives++;
            }
        }
    }
    exports.default = AcquireBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUNBLE1BQThCLFdBQVksU0FBUSxtQkFBUztRQVFuRCxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLElBQW9CO1lBQ2pFLE1BQU0sTUFBTSxHQUF1QjtnQkFDbEMscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekIseUJBQXlCLEVBQUUsQ0FBQztnQkFDNUIsZ0JBQWdCLEVBQUU7b0JBQ2pCLGVBQWUsRUFBRSxDQUFDO29CQUNsQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQix5QkFBeUIsRUFBRSxDQUFDO2lCQUM1QjthQUNELENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLFlBQVksV0FBVyxDQUFDO1lBQ2pFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO29CQUM3QixJQUFJLENBQUMsNEJBQTRCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNsRDthQUNEO1lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUU7Z0JBQzdCLE1BQU0sV0FB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
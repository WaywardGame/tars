/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBd0NILE1BQThCLFdBQVksU0FBUSxtQkFBUztRQVFuRCxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLElBQW9CO1lBQ2pFLE1BQU0sTUFBTSxHQUF1QjtnQkFDbEMscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekIseUJBQXlCLEVBQUUsQ0FBQztnQkFDNUIsZ0JBQWdCLEVBQUU7b0JBQ2pCLGVBQWUsRUFBRSxDQUFDO29CQUNsQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQixnQkFBZ0IsRUFBRSxDQUFDO29CQUNuQix5QkFBeUIsRUFBRSxDQUFDO2lCQUM1QjthQUNELENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLFlBQVksV0FBVyxDQUFDO1lBQ2pFLElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDeEIsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztZQUNGLENBQUM7WUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dCQUN4QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUUvQyxJQUFJLGFBQWEsS0FBSyx1QkFBdUIsRUFBRSxDQUFDO29CQUMvQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFHOUIsSUFBSSxNQUFNLENBQUMscUJBQXFCLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFHbEYsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQ2pDLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxTQUFTLENBQUMsTUFBMEIsRUFBRSxXQUErQjtZQUM1RSxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFvQyxFQUFFLENBQUM7Z0JBQzFFLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUN0QyxXQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQVcsQ0FBQztnQkFFcEQsQ0FBQztxQkFBTSxDQUFDO29CQUNQLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM1QyxXQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLE1BQU0sQ0FBQyxHQUFHLENBQVMsQ0FBQyxJQUFJLENBQVcsQ0FBQztvQkFDekUsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFLTyw0QkFBNEIsQ0FBQyxNQUEwQixFQUFFLElBQW9CO1lBQ3BGLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFOUMsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksMEJBQWdCLEVBQUUsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTVDLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLDBCQUFnQixFQUFFLENBQUM7Z0JBRXZELE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUMvQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUU1QyxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSxtQ0FBeUIsRUFBRSxDQUFDO2dCQUNoRSxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFFckQsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksMEJBQWdCLEVBQUUsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTVDLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLHlCQUFlLEVBQUUsQ0FBQztnQkFFdEQsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1FBQ0YsQ0FBQztRQUtPLDZCQUE2QixDQUFDLE1BQTBCLEVBQUUsSUFBb0I7WUFDckYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3BDLENBQUM7UUFTRixDQUFDO0tBRUQ7SUF2SEQsOEJBdUhDIn0=
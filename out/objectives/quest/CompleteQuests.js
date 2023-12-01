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
define(["require", "exports", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Restart", "./CompleteQuest"], function (require, exports, IObjective_1, Objective_1, Restart_1, CompleteQuest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CompleteQuests extends Objective_1.default {
        getIdentifier() {
            return "CompleteQuests";
        }
        getStatus() {
            return "Completing quests";
        }
        async execute(context) {
            const quests = context.human.quests.getQuests().filter(quest => !quest.data.complete);
            if (!quests || quests.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            for (const quest of quests) {
                objectivePipelines.push([new CompleteQuest_1.default(quest), new Restart_1.default()]);
            }
            return objectivePipelines;
        }
    }
    exports.default = CompleteQuests;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9xdWVzdC9Db21wbGV0ZVF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFTSCxNQUFxQixjQUFlLFNBQVEsbUJBQVM7UUFFN0MsYUFBYTtZQUNuQixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSx1QkFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUExQkQsaUNBMEJDIn0=
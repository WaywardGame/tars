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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9xdWVzdC9Db21wbGV0ZVF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUFxQixjQUFlLFNBQVEsbUJBQVM7UUFFMUMsYUFBYTtZQUNoQixPQUFPLGdCQUFnQixDQUFDO1FBQzVCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxtQkFBbUIsQ0FBQztRQUMvQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDaEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDeEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSx1QkFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN0RTtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBMUJELGlDQTBCQyJ9
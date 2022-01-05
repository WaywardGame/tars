define(["require", "exports", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Lambda", "../core/Restart", "./CompleteQuestRequirement"], function (require, exports, IObjective_1, Objective_1, Lambda_1, Restart_1, CompleteQuestRequirement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CompleteQuest extends Objective_1.default {
        constructor(quest) {
            super();
            this.quest = quest;
        }
        getIdentifier() {
            return `CompleteQuest:${this.quest.id}`;
        }
        getStatus() {
            var _a;
            return `Completing quest: ${(_a = this.quest.getTitle()) === null || _a === void 0 ? void 0 : _a.getString()}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const pendingRequirements = this.quest.data.requirements.filter(requirement => !requirement.completed);
            const isCompleted = this.quest.data.complete || pendingRequirements.length === 0;
            if (isCompleted) {
                if (this.quest.data.complete || !this.quest.needsManualCompletion()) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
                objectivePipelines.push([new Lambda_1.default(async () => {
                        this.quest.complete();
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus(this)]);
            }
            else {
                for (const requirement of pendingRequirements) {
                    objectivePipelines.push([new CompleteQuestRequirement_1.default(this.quest, requirement), new Restart_1.default()]);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = CompleteQuest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3F1ZXN0L0NvbXBsZXRlUXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRWhELFlBQTZCLEtBQW9CO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFVBQUssR0FBTCxLQUFLLENBQWU7UUFFakQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU0sU0FBUzs7WUFDWixPQUFPLHFCQUFxQixNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLDBDQUFFLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDckUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBRWpGLElBQUksV0FBVyxFQUFFO2dCQUNiLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO29CQUNqRSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNuQztnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ3RCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFFeEI7aUJBQU07Z0JBQ0gsS0FBSyxNQUFNLFdBQVcsSUFBSSxtQkFBbUIsRUFBRTtvQkFDM0Msa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxrQ0FBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbkc7YUFDSjtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBdkNELGdDQXVDQyJ9
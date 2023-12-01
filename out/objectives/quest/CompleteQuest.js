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
            return `Completing quest: ${this.quest.getTitle()?.getString()}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3F1ZXN0L0NvbXBsZXRlUXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBWUgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLEtBQW9CO1lBQ2hELEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQWU7UUFFakQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUJBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNsRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkcsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFFakYsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQztvQkFDckUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQztnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ3RCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLEtBQUssTUFBTSxXQUFXLElBQUksbUJBQW1CLEVBQUUsQ0FBQztvQkFDL0Msa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxrQ0FBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakcsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXZDRCxnQ0F1Q0MifQ==
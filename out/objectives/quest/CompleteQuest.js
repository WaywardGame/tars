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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVRdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3F1ZXN0L0NvbXBsZXRlUXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBWUgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRWhELFlBQTZCLEtBQW9CO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFVBQUssR0FBTCxLQUFLLENBQWU7UUFFakQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8scUJBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkcsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFFakYsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7b0JBQ2pFLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ25DO2dCQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDdEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUV4QjtpQkFBTTtnQkFDSCxLQUFLLE1BQU0sV0FBVyxJQUFJLG1CQUFtQixFQUFFO29CQUMzQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLGtDQUF3QixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUUsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNuRzthQUNKO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUF2Q0QsZ0NBdUNDIn0=
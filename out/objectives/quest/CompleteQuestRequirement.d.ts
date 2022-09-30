import type { QuestInstance } from "game/entity/player/quest/QuestManager";
import type { IQuestRequirement } from "game/entity/player/quest/requirement/IRequirement";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class CompleteQuestRequirement extends Objective {
    private readonly quest;
    private readonly requirement;
    constructor(quest: QuestInstance, requirement: IQuestRequirement);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getObjectivesForQuestRequirement;
    private getObjectivesForModdedQuestRequirement;
}

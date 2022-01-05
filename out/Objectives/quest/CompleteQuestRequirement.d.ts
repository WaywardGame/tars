import { IQuestRequirement } from "game/entity/player/quest/requirement/IRequirement";
import { QuestInstance } from "game/entity/player/quest/QuestManager";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class CompleteQuestRequirement extends Objective {
    private readonly quest;
    private readonly requirement;
    constructor(quest: QuestInstance, requirement: IQuestRequirement);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

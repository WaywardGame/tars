import { IQuestRequirement } from "game/entity/player/quest/requirement/IRequirement";
import { QuestInstance } from "game/entity/player/quest/QuestManager";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class CompleteQuestRequirement extends Objective {
    private readonly quest;
    private readonly requirement;
    constructor(quest: QuestInstance, requirement: IQuestRequirement);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

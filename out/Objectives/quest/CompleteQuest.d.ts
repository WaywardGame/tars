import { QuestInstance } from "game/entity/player/quest/QuestManager";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class CompleteQuest extends Objective {
    private readonly quest;
    constructor(quest: QuestInstance);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

import { QuestInstance } from "game/entity/player/quest/QuestManager";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class CompleteQuest extends Objective {
    private readonly quest;
    constructor(quest: QuestInstance);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

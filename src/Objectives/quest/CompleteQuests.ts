
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import Restart from "../core/Restart";
import CompleteQuest from "./CompleteQuest";

export default class CompleteQuests extends Objective {

    public getIdentifier(): string {
        return "CompleteQuests";
    }

    public getStatus(): string | undefined {
        return "Completing quests";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const quests = context.player.quests.getQuests().filter(quest => !quest.data.complete);
        if (quests.length === 0) {
            return ObjectiveResult.Complete;
        }

        const objectivePipelines: IObjective[][] = [];

        // restart after each quest in case theres more
        for (const quest of quests) {
            objectivePipelines.push([new CompleteQuest(quest), new Restart()]);
        }

        return objectivePipelines;
    }

}

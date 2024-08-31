import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
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
		const quests = context.human.quests.getQuests().filter(quest => !quest.data.complete);
		if (!quests || quests.length === 0) {
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

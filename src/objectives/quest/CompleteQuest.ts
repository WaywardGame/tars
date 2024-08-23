/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type { QuestInstance } from "@wayward/game/game/entity/player/quest/QuestManager";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Lambda from "../core/Lambda";
import Restart from "../core/Restart";
import CompleteQuestRequirement from "./CompleteQuestRequirement";

export default class CompleteQuest extends Objective {

	constructor(private readonly quest: QuestInstance) {
		super();
	}

	public getIdentifier(): string {
		return `CompleteQuest:${this.quest.id}`;
	}

	public getStatus(): string | undefined {
		return `Completing quest: ${this.quest.getTitle()?.getString()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const pendingRequirements = this.quest.data.requirements.filter(requirement => !requirement.completed);
		const isCompleted = this.quest.data.complete || pendingRequirements.length === 0;

		if (isCompleted) {
			if (this.quest.data.complete || !this.quest.needsManualCompletion()) {
				return ObjectiveResult.Complete;
			}

			objectivePipelines.push([new Lambda(async () => {
				this.quest.complete();
				return ObjectiveResult.Complete;
			}).setStatus(this)]);

		} else {
			for (const requirement of pendingRequirements) {
				objectivePipelines.push([new CompleteQuestRequirement(this.quest, requirement), new Restart()]);
			}
		}

		return objectivePipelines;
	}

}

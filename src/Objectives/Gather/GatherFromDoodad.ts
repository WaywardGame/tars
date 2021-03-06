import Doodad from "game/doodad/Doodad";
import { ItemType } from "game/item/IItem";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { DoodadSearchMap } from "../../ITars";
import Objective from "../../Objective";
import { objectUtilities } from "../../utilities/Object";
import { tileUtilities } from "../../utilities/Tile";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromDoodad extends Objective {

	constructor(private readonly itemType: ItemType, private readonly doodadSearchMap: DoodadSearchMap) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromDoodad:${ItemType[this.itemType]}`;
	}

	public canGroupTogether(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return objectUtilities.findDoodads(context, `${this.getIdentifier()}|1`, (doodad: Doodad) => {
			const searchMap = this.doodadSearchMap.get(doodad.type);
			if (!searchMap) {
				return false;
			}

			const description = doodad.description();
			if (!description) {
				return false;
			}

			const growingStage = doodad.getGrowingStage();
			if (growingStage === undefined || (description.gather?.[growingStage] === undefined && description.harvest?.[growingStage] === undefined)) {
				return false;
			}

			const difficulty = searchMap.get(growingStage);
			if (difficulty === undefined) {
				return false;
			}

			// todo: use difficulty

			return tileUtilities.canGather(doodad.getTile(), true);
		}, 5)
			.map(target => {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(target, true));

				objectives.push(new ExecuteActionForItem(ExecuteActionType.Doodad, [this.itemType])
					.passContextDataKey(this)
					.setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from ${target.getName()}`));

				return objectives;
			});
	}

	protected getBaseDifficulty(context: Context): number {
		return 20;
	}

}

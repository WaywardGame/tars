import Doodad from "doodad/Doodad";
import { DoodadType, GrowingStage } from "doodad/IDoodad";
import { ItemType } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { DoodadSearch } from "../../ITars";
import Objective from "../../Objective";
import { findDoodads } from "../../Utilities/Object";
import { canGather } from "../../Utilities/Tile";
import ExecuteActionForItem, { ExecuteActionType } from "../Core/ExecuteActionForItem";
import MoveToTarget from "../Core/MoveToTarget";

export default class GatherFromDoodad extends Objective {

	constructor(private readonly search: DoodadSearch[]) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromDoodad:${this.search.map(search => `${DoodadType[search.type]}:${GrowingStage[search.growingStage]}:${ItemType[search.itemType]}`).join(",")}`;
	}

	public canGroupTogether(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const targets = findDoodads(context, `${this.getIdentifier()}|1`, (doodad: Doodad) => {
			const description = doodad.description();
			if (!description) {
				return false;
			}

			const growingStage = doodad.getGrowingStage();
			if (growingStage === undefined || (description.gather?.[growingStage] === undefined && description.harvest?.[growingStage] === undefined)) {
				return false;
			}

			return this.search.findIndex(search => search.type === doodad.type && search.growingStage === growingStage) !== -1 && canGather(doodad.getTile(), true);
		}, 5);

		// todo: add extra difficulty to targets / findDoodads method
		return targets.map(target => {
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(target, true));

			objectives.push(new ExecuteActionForItem(ExecuteActionType.Doodad, this.search.map(search => search.itemType)).passContextDataKey(this));

			return objectives;
		});
	}

	protected getBaseDifficulty(context: Context): number {
		return 20;
	}

}

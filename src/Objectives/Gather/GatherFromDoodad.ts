import Doodad from "doodad/Doodad";
import { DoodadType, GrowingStage } from "doodad/IDoodad";
import { ItemType } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { DoodadSearch } from "../../ITars";
import Objective from "../../Objective";
import { findDoodads } from "../../Utilities/Object";
import { hasCorpses } from "../../Utilities/Tile";
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
		let targets = findDoodads(context, `${this.getIdentifier()}|1`, (doodad: Doodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === doodad.getGrowingStage()) !== -1 && !hasCorpses(doodad.getTile()), 5);
		if (targets.length === 0) {
			targets = findDoodads(context, `${this.getIdentifier()}|2`, (doodad: Doodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === GrowingStage.Bare) !== -1 && !hasCorpses(doodad.getTile()), 5);
		}

		return targets.map(target => {
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(target, true));

			objectives.push(new ExecuteActionForItem(ExecuteActionType.Doodad, this.search.map(search => search.itemType)));

			return objectives;
		});
	}

	protected getBaseDifficulty(context: Context): number {
		return 20;
	}

}

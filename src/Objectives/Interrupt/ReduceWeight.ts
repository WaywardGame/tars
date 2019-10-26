import { WeightStatus } from "entity/player/IPlayer";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import OrganizeInventory from "../Utility/OrganizeInventory";

export default class ReduceWeight extends Objective {

	constructor(private readonly force: boolean = false) {
		super();
	}

	public getIdentifier(): string {
		return "ReduceWeight";
	}

	public canSaveChildObjectives(): boolean {
		return false;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const weightStatus = context.player.getWeightStatus();
		if (weightStatus === WeightStatus.None) {
			return ObjectiveResult.Ignore;
		}

		return new OrganizeInventory(weightStatus !== WeightStatus.Overburdened, this.force);
	}

}

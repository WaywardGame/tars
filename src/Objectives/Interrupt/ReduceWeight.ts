import { WeightStatus } from "game/entity/player/IPlayer";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import OrganizeInventory, { IOriganizeInventoryOptions } from "../utility/OrganizeInventory";

export default class ReduceWeight extends Objective {

	constructor(private readonly options: IOriganizeInventoryOptions = {}) {
		super();
	}

	public getIdentifier(): string {
		return "ReduceWeight";
	}

	public getStatus(): string {
		return "Reducing weight";
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

		return new OrganizeInventory({
			allowChests: weightStatus !== WeightStatus.Overburdened,
			...this.options,
		});
	}

}

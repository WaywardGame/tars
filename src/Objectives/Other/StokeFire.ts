import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import MoveToTarget from "../Core/MoveToTarget";

import StartFire from "./StartFire";
import UseItem from "./UseItem";

export default class StokeFire extends Objective {

	constructor(private readonly doodad?: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StokeFire:${this.doodad}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodad = this.doodad || context.getData(ContextDataType.LastBuiltDoodad);
		if (!doodad) {
			this.log.error("Invalid doodad");
			return ObjectiveResult.Restart;
		}

		const objectives: IObjective[] = [];

		const description = doodad.description();
		if (description && !description.providesFire) {
			objectives.push(new StartFire(doodad));
		}

		if (context.inventory.fireStoker === undefined) {
			objectives.push(new AcquireItemForAction(ActionType.StokeFire));
		}

		objectives.push(new MoveToTarget(doodad, true));

		objectives.push(new UseItem(ActionType.StokeFire, context.inventory.fireStoker));

		return objectives;
	}

}

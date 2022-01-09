import type Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "../item/UseItem";
import StartFire from "./StartFire";

export default class StokeFire extends Objective {

	constructor(private readonly doodad?: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StokeFire:${this.doodad}`;
	}

	public getStatus(): string | undefined {
		return `Stoking ${this.doodad?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodad = this.doodad ?? context.getData(ContextDataType.LastBuiltDoodad);
		if (!doodad) {
			this.log.error("Invalid doodad");
			return ObjectiveResult.Restart;
		}

		const objectives: IObjective[] = [];

		const description = doodad.description();
		if (description && !description.providesFire) {
			objectives.push(new StartFire(doodad));
		}

		if (context.inventory.fireKindling === undefined || context.inventory.fireKindling.length === 0) {
			objectives.push(new AcquireItemForAction(ActionType.StokeFire));
		}

		objectives.push(new MoveToTarget(doodad, true));

		objectives.push(new UseItem(ActionType.StokeFire, context.inventory.fireKindling?.[0]));

		return objectives;
	}

}

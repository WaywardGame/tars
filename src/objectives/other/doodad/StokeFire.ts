import type Doodad from "game/doodad/Doodad";
import StokeFireAction from "game/entity/action/actions/StokeFire";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

import StartFire from "./StartFire";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import { ReserveType } from "../../../core/ITars";
import ExecuteAction from "../../core/ExecuteAction";
import Item from "game/item/Item";
import { ActionArguments } from "game/entity/action/IAction";

export default class StokeFire extends Objective {

	constructor(private readonly doodad?: Doodad, private readonly numberOfStokes: number = 0) {
		super();
	}

	public getIdentifier(): string {
		return `StokeFire:${this.doodad}:${this.numberOfStokes}`;
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

		const itemContextDataKey = this.getUniqueContextDataKey("Kindling");

		const objectives: IObjective[] = [];

		const description = doodad.description;
		if (description && !description.providesFire) {
			objectives.push(new StartFire(doodad));
		}

		objectives.push(new AcquireInventoryItem("fireKindling", { skipHardReservedItems: true, reserveType: ReserveType.Hard, desiredCount: this.numberOfStokes }).setContextDataKey(itemContextDataKey));

		objectives.push(new MoveToTarget(doodad, true));

		objectives.push(new ExecuteAction(StokeFireAction, (context) => {
			const kindling = context.getData<Item>(itemContextDataKey);
			if (!kindling?.isValid()) {
				this.log.warn("Invalid StokeFire kindling");
				return ObjectiveResult.Restart;
			}

			return [kindling] as ActionArguments<typeof StokeFireAction>;
		}).setStatus(this));

		return objectives;
	}

}

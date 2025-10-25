import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import Ignite from "@wayward/game/game/entity/action/actions/Ignite";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";

export default class IgniteItem extends Objective {

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `IgniteItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Igniting ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid) {
			this.log.error("Invalid ignite item");
			return ObjectiveResult.Restart;
		}

		const description = item.description;
		if (!description || !description.lit || !description.use?.includes(ActionType.Ignite)) {
			this.log.error(`Invalid ignite item. ${item}`);
			return ObjectiveResult.Impossible;
		}

		const { AcquireBuildMoveToFire, EquipItem, UseItem } = context.objectives;

		return [
			new AcquireBuildMoveToFire(),
			new EquipItem(EquipType.Held, item),
			new UseItem(Ignite, item),
		];
	}

}

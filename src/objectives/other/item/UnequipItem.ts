import type Item from "@wayward/game/game/item/Item";
import Unequip from "@wayward/game/game/entity/action/actions/Unequip";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";

export default class UnequipItem extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `Unequip:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Unequipping ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid) {
			this.log.error("Invalid unequip item");
			return ObjectiveResult.Restart;
		}

		if (!item.isEquipped(true)) {
			return ObjectiveResult.Complete;
		}

		const { ReserveItems, ExecuteAction } = context.objectives;

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(Unequip, [item]).setStatus(this),
		];
	}

}

import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import type { IContainer } from "game/item/IItem";
import Doodad from "game/doodad/Doodad";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";

export default class MoveItem extends Objective {

	constructor(private readonly item: Item | undefined, private readonly targetContainer: IContainer, private readonly source: Doodad | IVector3) {
		super();
	}

	public getIdentifier(): string {
		return `MoveItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		if (Doodad.is(this.source)) {
			return `Moving ${this.item?.getName()} into the inventory from ${this.source.getName()}`;
		}

		return `Moving ${this.item?.getName()} into the inventory from (${this.source.x},${this.source.y},${this.source.z})`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item) {
			this.log.error("Invalid move item");
			return ObjectiveResult.Restart;
		}

		return new Lambda(async context => {
			if (item.containedWithin === this.targetContainer) {
				return ObjectiveResult.Complete;
			}

			return new ExecuteAction(ActionType.MoveItem, (context, action) => {
				action.execute(context.player, item, this.targetContainer);
				return ObjectiveResult.Complete;
			}).setStatus(this);
		}).setStatus(this);
	}
}

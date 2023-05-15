/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Item from "game/item/Item";
import type { IContainer } from "game/item/IItem";
import Doodad from "game/doodad/Doodad";
import MoveItemAction from "game/entity/action/actions/MoveItem";
import { ActionArguments } from "game/entity/action/IAction";
import { IVector3 } from "utilities/math/IVector";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";

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
		if (!item?.isValid()) {
			this.log.warn(`Invalid move item ${item}`);
			return ObjectiveResult.Restart;
		}

		return new ExecuteAction(MoveItemAction, () => {
			if (item.containedWithin === this.targetContainer) {
				return ObjectiveResult.Complete;
			}

			// console.warn(context.island.items.hasRoomInContainer(this.targetContainer, item));

			// const weightCapacity = context.island.items.getWeightCapacity(this.targetContainer);
			// if (weightCapacity !== undefined && context.island.items.computeContainerWeight(this.targetContainer) + item.getTotalWeight() > weightCapacity) {
			// 	// we won't be able to move the item
			// 	return ObjectiveResult.Restart;
			// }

			return [item, this.targetContainer] as ActionArguments<typeof MoveItemAction>;
		}).setStatus(this);
	}

	protected override getBaseDifficulty() {
		return 1;
	}
}

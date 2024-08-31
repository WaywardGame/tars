import { EquipType } from "@wayward/game/game/entity/IHuman";
import type Item from "@wayward/game/game/item/Item";
import Equip from "@wayward/game/game/entity/action/actions/Equip";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import ReserveItems from "../../core/ReserveItems";

export default class EquipItem extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly equip: EquipType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `EquipItem:${this.item}:${this.equip}`;
	}

	public getStatus(): string | undefined {
		return `Equipping ${this.item?.getName()} in slot ${EquipType[this.equip]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid) {
			this.log.error(`Invalid equip item. ${item} for ${EquipType[this.equip]}`);
			return ObjectiveResult.Restart;
		}

		if (item.isEquipped(true)) {
			return ObjectiveResult.Complete;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(Equip, [item, this.equip]).setStatus(this),
		];
	}

}

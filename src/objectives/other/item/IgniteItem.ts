/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import Ignite from "@wayward/game/game/entity/action/actions/Ignite";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireBuildMoveToFire from "../../acquire/doodad/AcquireBuildMoveToFire";
import EquipItem from "./EquipItem";

import UseItem from "./UseItem";

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

		return [
			new AcquireBuildMoveToFire(),
			new EquipItem(EquipType.Held, item),
			new UseItem(Ignite, item),
		];
	}

}

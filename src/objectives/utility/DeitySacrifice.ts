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

import Sacrifice from "@wayward/game/game/entity/action/actions/Sacrifice";
import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import { IContainer, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import { Deity } from "@wayward/game/game/deity/Deity";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Restart from "../core/Restart";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import BuildItem from "../other/item/BuildItem";
import MoveItemsIntoInventory from "../other/item/MoveItemsIntoInventory";
import MoveToTarget from "../core/MoveToTarget";
import MoveItems from "../other/item/MoveItems";
import ExecuteAction from "../core/ExecuteAction";
import ReserveItems from "../core/ReserveItems";

export default class DeitySacrifice extends Objective {

	constructor(private readonly deity: Deity) {
		super();
	}

	public getIdentifier(): string {
		return `DeitySacrifice:${this.deity}`;
	}

	public getStatus(): string | undefined {
		return `Sacrificing items to ${Deity[this.deity]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.alignment.invoked) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		if (context.base.altar.length === 0) {
			objectives.push(new AcquireInventoryItem("altar"), new BuildItem(), new Restart());

		} else {
			const altar = context.base.altar[0];

			let runes = context.utilities.item.getBaseItems(context).filter(item => item.isInGroup(ItemTypeGroup.ArtifactOfInvocation));

			// test limit
			runes = runes.slice(0, 5);

			objectives.push(new ReserveItems(...runes));

			for (const item of runes) {
				objectives.push(new MoveItemsIntoInventory(item));
			}

			objectives.push(new MoveToTarget(context.base.altar[0], true));

			for (const item of runes) {
				objectives.push(new MoveItems(item, altar as IContainer));
			}

			objectives.push(new ExecuteAction(Sacrifice, () => {
				return [{ deity: this.deity, altar }] as ActionArgumentsOf<typeof Sacrifice>;
			}).setStatus(this));
		}

		return objectives;
	}

}

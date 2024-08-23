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

import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import Offer from "@wayward/game/game/entity/action/actions/Offer";
import type Creature from "@wayward/game/game/entity/creature/Creature";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItemForTaming from "../../acquire/item/AcquireItemForTaming";
import SetContextData from "../../contextData/SetContextData";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import ReserveItems from "../../core/ReserveItems";

export default class TameCreature extends Objective {

	constructor(private readonly creature: Creature) {
		super();
	}

	public getIdentifier(): string {
		return `TameCreature:${this.creature}`;
	}

	public getStatus(): string | undefined {
		return `Taming ${this.creature.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.creature.isValid) {
			return ObjectiveResult.Restart;
		}

		if (this.creature.isTamed && this.creature.getOwner() === context.human) {
			return ObjectiveResult.Complete;
		}

		const acceptedItems = this.creature.description?.acceptedItems;
		if (!acceptedItems || acceptedItems.length === 0) {
			return ObjectiveResult.Impossible;
		}

		const itemContextDataKey = this.getUniqueContextDataKey("OfferItem");

		const objectives: IObjective[] = [];

		const items = context.utilities.item.getItemsInInventory(context);

		const offerItem = this.creature.offer(items);
		if (offerItem) {
			objectives.push(new ReserveItems(offerItem).keepInInventory());
			objectives.push(new SetContextData(itemContextDataKey, offerItem));

		} else {
			objectives.push(new AcquireItemForTaming(this.creature).setContextDataKey(itemContextDataKey));
		}

		objectives.push(new SetContextData(ContextDataType.TamingCreature, this.creature));

		objectives.push(new MoveToTarget(this.creature, true));

		objectives.push(new ExecuteAction(Offer, (context) => {
			const item = context.getData(itemContextDataKey);
			if (!item?.isValid) {
				this.log.error("Invalid offer item");
				return ObjectiveResult.Restart;
			}

			return [item] as ActionArgumentsOf<typeof Offer>;
		}).setStatus(this));

		objectives.push(new SetContextData(ContextDataType.TamingCreature, undefined));

		objectives.push(new Lambda(async context => {
			return this.creature.isValid && this.creature.isTamed && this.creature.getOwner() === context.human ? ObjectiveResult.Complete : ObjectiveResult.Restart;
		}).setStatus(this));

		return objectives;
	}
}

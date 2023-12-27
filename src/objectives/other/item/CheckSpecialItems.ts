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

import { BookType, ItemType } from "@wayward/game/game/item/IItem";
import Read from "@wayward/game/game/entity/action/actions/Read";
import OpenBottle from "@wayward/game/game/entity/action/actions/OpenBottle";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ReserveItems from "../../core/ReserveItems";
import ExecuteAction from "../../core/ExecuteAction";
import MoveItemsIntoInventory from "./MoveItemsIntoInventory";

/**
 * Looks for items that are special and try to use them
 */
export default class CheckSpecialItems extends Objective {

	public getIdentifier(): string {
		return "CheckSpecialItems";
	}

	public getStatus(): string | undefined {
		return "Checking for special items";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const baseItems = context.utilities.item.getBaseItems(context);

		const messageInABottles = baseItems
			.filter(item => item.type === ItemType.MessageInABottle);
		if (messageInABottles.length > 0) {
			return messageInABottles.map(item => ([
				new ReserveItems(item).keepInInventory(),
				new MoveItemsIntoInventory(item),
				new ExecuteActionForItem(
					ExecuteActionType.Generic,
					[ItemType.GlassBottle],
					{
						genericAction: {
							action: OpenBottle,
							args: [item],
						},
					}).setStatus("Opening glass bottle")
			]));
		}

		if (context.options.survivalReadBooks) {
			const books = baseItems
				.filter(item => item.book === BookType.RandomEvent);
			if (books.length > 0) {
				return books.map(item => ([
					new ReserveItems(item).keepInInventory(),
					new MoveItemsIntoInventory(item),
					new ExecuteAction(Read, [item]).setStatus(`Reading ${item.getName()}`),
				]));
			}
		}

		return ObjectiveResult.Ignore;
	}

}

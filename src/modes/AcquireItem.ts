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

import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import type Human from "game/entity/Human";
import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";

import type { ITarsMode } from "../core/mode/IMode";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";

export class AcquireItemMode implements ITarsMode {

	private finished: (success: boolean) => void;

	constructor(private readonly itemType: ItemType) {
	}

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
	}

	public async determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>> {
		return [new AcquireItem(this.itemType, { allowCraftingForUnmetRequiredDoodads: true })];
	}

	@EventHandler(EventBus.LocalPlayer, "inventoryItemAdd")
	@EventHandler(EventBus.LocalPlayer, "inventoryItemUpdate")
	public onInventoryItemAddOrUpdate(_: Human, items: Item[]) {
		// todo: compare player with context.player?
		if (items.some(item => item.type === this.itemType)) {
			this.finished(true);
		}
		// todo: analyze inventory?
	}
}

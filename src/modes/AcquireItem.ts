import { EventBus } from "@wayward/game/event/EventBuses";
import { EventHandler } from "@wayward/game/event/EventManager";
import type Human from "@wayward/game/game/entity/Human";
import type { ItemType } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";

import type { ITarsMode } from "../core/mode/IMode";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";

export class AcquireItemMode implements ITarsMode {

	private finished: (success: boolean) => void;

	constructor(private readonly itemType: ItemType) {
	}

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>> {
		return [new AcquireItem(this.itemType, { allowCraftingForUnmetRequiredDoodads: true })];
	}

	@EventHandler(EventBus.LocalPlayer, "inventoryItemAdd")
	@EventHandler(EventBus.LocalPlayer, "inventoryItemUpdate")
	public onInventoryItemAddOrUpdate(_: Human, items: Item[]): void {
		// todo: compare player with context.player?
		if (items.some(item => item.type === this.itemType)) {
			this.finished(true);
		}
		// todo: analyze inventory?
	}
}

import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import Player from "game/entity/player/Player";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective } from "../../IObjective";
import AcquireItem from "../../objectives/acquire/item/AcquireItem";
import { ITarsMode } from "../IMode";

export class AcquireItemMode implements ITarsMode {

	private finished: (success: boolean) => void;

	constructor(private readonly itemType: ItemType) {
	}

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
	}

	public async determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>> {
		return [new AcquireItem(this.itemType)];
	}

	@EventHandler(EventBus.LocalPlayer, "inventoryItemAdd")
	@EventHandler(EventBus.LocalPlayer, "inventoryItemUpdate")
	public onInventoryItemAddOrUpdate(_: Player, item: Item) {
		// todo: compare player with context.player?
		if (item.type === this.itemType) {
			this.finished(true);
		}
		// todo: analyze inventory?
	}
}

import { EventBus } from "event/EventBuses";
import EventManager, { EventHandler } from "event/EventManager";
import Player from "game/entity/player/Player";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective } from "../../IObjective";
import AcquireItem from "../../objectives/acquire/item/AcquireItem";
import { ITarsMode } from "../IMode";

export class AcquireItemMode implements ITarsMode {

	private finished: () => void;

	constructor(private readonly itemType: ItemType) {
	}

	public async initialize(_: Context, finished: () => void) {
		this.finished = finished;
		EventManager.registerEventBusSubscriber(this);
	}

	public async dispose() {
		EventManager.deregisterEventBusSubscriber(this);
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		return [new AcquireItem(this.itemType)];
	}

	@EventHandler(EventBus.LocalPlayer, "inventoryItemAdd")
	public onInventoryItemAdd(_: Player, item: Item) {
		// todo: compare player with context.player?
		if (item.type === this.itemType) {
			this.finished();
		}
		// todo: analyze inventory?
	}
}

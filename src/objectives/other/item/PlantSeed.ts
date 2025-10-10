import { ItemType } from "@wayward/game/game/item/IItem";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import Plant from "@wayward/game/game/entity/action/actions/Plant";
import type Item from "@wayward/game/game/item/Item";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";

export const gardenMaxTilesChecked = 1536;

export default class PlantSeed extends Objective {

	constructor(private readonly itemOrItemType: Item | ItemType, private readonly maxTilesChecked: number | undefined = gardenMaxTilesChecked) {
		super();
	}

	public getIdentifier(): string {
		return `PlantSeed:${typeof (this.itemOrItemType) === "number" ? ItemType[this.itemOrItemType] : this.itemOrItemType}`;
	}

	public getStatus(): string | undefined {
		return `Planting ${typeof (this.itemOrItemType) === "number" ? Translation.nameOf(Dictionary.Item, this.itemOrItemType).getString() : this.itemOrItemType.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = typeof (this.itemOrItemType) === "number" ? this.getAcquiredItem(context) : this.itemOrItemType;
		if (!item?.isValid) {
			this.log.error("Invalid seed item");
			return ObjectiveResult.Restart;
		}

		const { UseItem, ReserveItems, MoveItemsIntoInventory, TillForSeed } = context.objectives;

		return [
			new ReserveItems(item).keepInInventory(),
			new MoveItemsIntoInventory(item),
			new TillForSeed(item.type, this.maxTilesChecked),
			new UseItem(Plant, item),
		];
	}

}

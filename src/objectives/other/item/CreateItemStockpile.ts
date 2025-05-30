import type { IContainer } from "@wayward/game/game/item/IItem";
import { ItemType } from "@wayward/game/game/item/IItem";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "../../acquire/item/AcquireItem";
import ReserveItems from "../../core/ReserveItems";

import MoveIntoChest from "../../utility/MoveIntoChest";

/**
 * Acquires items and moves them into chests in the base
 * It will ensure {count} items exist between the inventory / base chests
 */
export default class CreateItemStockpile extends Objective {

	constructor(private readonly itemType: ItemType, private readonly count: number = 1) {
		super();
	}

	public getIdentifier(): string {
		return `CreateItemStockpile:${ItemType[this.itemType]}:${this.count}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const baseItems = [...context.base.chest, ...context.base.intermediateChest]
			.map(chest => context.utilities.item.getItemsInContainerByType(context, chest as IContainer, this.itemType))
			.flat();

		const inventoryItems = context.utilities.item.getItemsInContainerByType(context, context.human.inventory, this.itemType);

		const acquireCount = this.count - baseItems.length - inventoryItems.length;
		if (acquireCount <= 0) {
			return ObjectiveResult.Complete;
		}

		const objectives: IObjective[] = [];

		for (const baseItem of baseItems) {
			objectives.push(new ReserveItems(baseItem));
		}

		this.log.info(`Acquiring ${ItemType[this.itemType]} x${this.count} for the stockpile. x${acquireCount} needs to be acquired. x${inventoryItems.length} in inventory.`);

		for (let i = 0; i < acquireCount; i++) {
			objectives.push(new AcquireItem(this.itemType));
			objectives.push(new MoveIntoChest());
		}

		// if (inventoryItems.length > 0) {
		// 	objectives.push(new MoveIntoChest(inventoryItems));
		// }

		return objectives;
	}
}

import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import { ListEnder } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";
import Vector2 from "@wayward/game/utilities/math/Vector2";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import BuildItem from "../other/item/BuildItem";
import MoveItemsFromContainer from "../other/item/MoveItemsFromContainer";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";

export default class MoveIntoChest extends Objective {

	constructor(private readonly itemsToMove?: Item[], private readonly maxChestDistance?: number) {
		super();
	}

	public getIdentifier(): string {
		return `MoveIntoChest:${this.itemsToMove ? this.itemsToMove.join(", ") : undefined}`;
	}

	public getStatus(): string | undefined {
		if (!this.itemsToMove) {
			return "Moving items into chests";
		}

		const translation = this.itemsToMove.map(item => item.getName())
			.collect(Translation.formatList, ListEnder.And);

		return `Moving ${translation.getString()} into chests`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const itemsToMove = this.itemsToMove ?? [this.getAcquiredItem(context)];
		const firstItem = itemsToMove[0];
		if (!firstItem?.isValid) {
			this.log.warn("Invalid item to move");
			return ObjectiveResult.Restart;
		}

		const objectivePipelines: IObjective[][] = [];

		const chests = context.base.chest
			.slice()
			.sort((a, b) => context.island.items.computeContainerWeight(a as IContainer) - context.island.items.computeContainerWeight(b as IContainer));
		for (const chest of chests) {
			if (this.maxChestDistance !== undefined && Vector2.distance(context.human, chest) > this.maxChestDistance) {
				continue;
			}

			const targetContainer = chest as IContainer;
			if (context.island.items.hasRoomInContainer(targetContainer, firstItem)) {
				// at least 1 item fits in the chest
				objectivePipelines.push([
					new MoveToTarget(chest, true),
					new MoveItemsFromContainer(itemsToMove as Item[], targetContainer, chest),
				]);
			}
		}

		if (objectivePipelines.length === 0) {
			this.log.info("Build another chest");

			objectivePipelines.push([new AcquireInventoryItem("chest"), new BuildItem()]);
		}

		return objectivePipelines;
	}
}

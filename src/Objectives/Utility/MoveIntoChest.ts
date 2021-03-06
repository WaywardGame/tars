import { DoodadType } from "game/doodad/IDoodad";
import { IContainer } from "game/item/IItem";
import Item from "game/item/Item";
import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireItemForDoodad from "../acquire/item/AcquireItemForDoodad";
import AnalyzeBase from "../analyze/AnalyzeBase";
import MoveToTarget from "../core/MoveToTarget";
import BuildItem from "../other/item/BuildItem";
import MoveItem from "../other/item/MoveItem";

export default class MoveIntoChest extends Objective {

	constructor(private readonly itemsToMove?: Item[], private readonly maxChestDistance?: number) {
		super();
	}

	public getIdentifier(): string {
		return `MoveIntoChest:${this.itemsToMove ? this.itemsToMove.join(", ") : undefined}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const itemsToMove = this.itemsToMove || [context.getData(ContextDataType.LastAcquiredItem)];
		const firstItem = itemsToMove[0];
		if (!firstItem) {
			this.log.error("Invalid item to move");
			return ObjectiveResult.Restart;
		}

		const objectivePipelines: IObjective[][] = [];

		const chests = context.base.chest
			.slice()
			.sort((a, b) => itemManager.computeContainerWeight(a as IContainer) - itemManager.computeContainerWeight(b as IContainer));
		for (const chest of chests) {
			if (this.maxChestDistance !== undefined && Vector2.distance(context.player, chest) > this.maxChestDistance) {
				continue;
			}

			const targetContainer = chest as IContainer;
			const weight = itemManager.computeContainerWeight(targetContainer);
			if (weight + firstItem.getTotalWeight() <= itemManager.getWeightCapacity(targetContainer)!) {
				// at least 1 item fits in the chest
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(chest, true));

				for (const item of itemsToMove) {
					objectives.push(new MoveItem(item, targetContainer));
				}

				objectivePipelines.push(objectives);
			}
		}

		if (objectivePipelines.length === 0) {
			this.log.info("Build another chest");

			objectivePipelines.push([new AcquireItemForDoodad(DoodadType.WoodenChest), new BuildItem(), new AnalyzeBase()]);
		}

		return objectivePipelines;
	}
}

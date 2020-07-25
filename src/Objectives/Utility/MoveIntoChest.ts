import { DoodadType } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";
import { IContainer } from "item/IItem";
import Item from "item/Item";
import Vector2 from "utilities/math/Vector2";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireItemForDoodad from "../Acquire/Item/AcquireItemForDoodad";
import AnalyzeBase from "../Analyze/AnalyzeBase";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";
import BuildItem from "../Other/BuildItem";

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
			.sort((a, b) => itemManager.computeContainerWeight(a as IContainer) > itemManager.computeContainerWeight(b as IContainer) ? 1 : -1);
		for (const chest of chests) {
			if (this.maxChestDistance !== undefined && Vector2.distance(context.player, chest) > this.maxChestDistance) {
				continue;
			}

			const targetContainer = chest as IContainer;
			const weight = itemManager.computeContainerWeight(targetContainer);
			if (weight + firstItem.getTotalWeight() <= targetContainer.weightCapacity!) {
				// at least 1 item fits in the chest
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(chest, true));

				for (const item of itemsToMove) {
					objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
						action.execute(context.player, item, targetContainer);
					}));
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

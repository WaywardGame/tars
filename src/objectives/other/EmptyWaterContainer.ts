import Pour from "game/entity/action/actions/Pour";
import type Item from "game/item/Item";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { anyWaterTileLocation } from "../../core/navigation/INavigation";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";

import UseItem from "./item/UseItem";

/**
 * Emptys a water container into the ocean
 */
export default class EmptyWaterContainer extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `EmptyWaterContainer:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Emptying ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = await context.utilities.tile.getNearestTileLocation(context, anyWaterTileLocation);

		for (const { point } of targets) {
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(point, true));

			objectives.push(new UseItem(Pour, this.item));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}
}

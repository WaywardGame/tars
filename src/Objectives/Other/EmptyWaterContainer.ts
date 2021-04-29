import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { anyWaterTileLocation } from "../../Navigation/INavigation";
import Objective from "../../Objective";
import { getNearestTileLocation } from "../../Utilities/Tile";
import MoveToTarget from "../Core/MoveToTarget";

import UseItem from "./UseItem";

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

	public getStatus(): string {
		return `Emptying ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = await getNearestTileLocation(context, anyWaterTileLocation);

		for (const { point } of targets) {
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(point, true));

			objectives.push(new UseItem(ActionType.Pour, this.item));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}
}

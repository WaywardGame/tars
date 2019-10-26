import Item from "item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

import GatherWaterFromStill from "./GatherWaterFromStill";
import GatherWaterFromTerrain from "./GatherWaterFromTerrain";
import GatherWaterFromWell from "./GatherWaterFromWell";

export default class GatherWater extends Objective {

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWater:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.item) {
			return ObjectiveResult.Restart;
		}

		const objectivePipelines: IObjective[][] = [];

		objectivePipelines.push([new GatherWaterFromTerrain(this.item)]);

		for (const waterStill of context.base.waterStill) {
			objectivePipelines.push([new GatherWaterFromStill(waterStill, this.item)]);
		}

		for (const well of context.base.well) {
			objectivePipelines.push([new GatherWaterFromWell(well, this.item)]);
		}

		return objectivePipelines;
	}
}

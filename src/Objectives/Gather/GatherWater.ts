import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

import GatherWaterFromStill from "./GatherWaterFromStill";
import GatherWaterFromTerrain from "./GatherWaterFromTerrain";
import GatherWaterFromWell from "./GatherWaterFromWell";

export interface IGatherWaterOptions {
	disallowTerrain?: boolean;
	disallowWaterStill?: boolean;
	disallowWell?: boolean;
	allowStartingWaterStill?: boolean;
	allowWaitingForWaterStill?: boolean;
}

export default class GatherWater extends Objective {

	constructor(private readonly item?: Item, private readonly options?: IGatherWaterOptions) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWater:${this.item}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWaterStill}`;
	}

	public getStatus(): string {
		return `Gathering water into ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.item) {
			return ObjectiveResult.Restart;
		}

		const objectivePipelines: IObjective[][] = [];

		if (!this.options?.disallowTerrain) {
			objectivePipelines.push([new GatherWaterFromTerrain(this.item)]);
		}

		if (!this.options?.disallowWaterStill) {
			for (const waterStill of context.base.waterStill) {
				objectivePipelines.push([new GatherWaterFromStill(waterStill, this.item, this.options?.allowStartingWaterStill, this.options?.allowWaitingForWaterStill)]);
			}
		}

		if (!this.options?.disallowWell) {
			for (const well of context.base.well) {
				objectivePipelines.push([new GatherWaterFromWell(well, this.item)]);
			}
		}

		return objectivePipelines;
	}
}

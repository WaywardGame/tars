import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

import GatherWaterFromStill, { IGatherWaterFromStillOptions } from "./GatherWaterFromStill";
import GatherWaterFromTerrain from "./GatherWaterFromTerrain";
import GatherWaterFromWell from "./GatherWaterFromWell";
import GatherWaterWithRecipe from "./GatherWaterWithRecipe";

export interface IGatherWaterOptions extends IGatherWaterFromStillOptions {
	disallowRecipe: boolean;
	disallowTerrain: boolean;
	disallowWaterStill: boolean;
	disallowWell: boolean;
}

/**
 * Gathers water into the container
 * The water may be unpurified
 */
export default class GatherWater extends Objective {

	constructor(private readonly waterContainer?: Item, private readonly options?: Partial<IGatherWaterOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWater:${this.waterContainer}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.disallowRecipe}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWaterStill}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water into ${this.waterContainer?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.waterContainer) {
			return ObjectiveResult.Restart;
		}

		const objectivePipelines: IObjective[][] = [];

		if (!this.options?.disallowTerrain) {
			objectivePipelines.push([new GatherWaterFromTerrain(this.waterContainer)]);
		}

		if (!this.options?.disallowWaterStill) {
			for (const waterStill of context.base.waterStill) {
				objectivePipelines.push([new GatherWaterFromStill(waterStill, this.waterContainer, {
					allowStartingWaterStill: this.options?.allowStartingWaterStill,
					allowWaitingForWaterStill: this.options?.allowWaitingForWaterStill,
				})]);
			}
		}

		if (!this.options?.disallowWell) {
			for (const well of context.base.well) {
				objectivePipelines.push([new GatherWaterFromWell(well, this.waterContainer)]);
			}
		}

		if (!this.options?.disallowRecipe) {
			objectivePipelines.push([new GatherWaterWithRecipe(this.waterContainer)]);
		}

		return objectivePipelines;
	}
}

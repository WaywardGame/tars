import Item from "game/item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import GatherWater, { IGatherWaterOptions } from "./GatherWater";

/**
 * Gathers water into one of the containers
 * The water may be unpurified
 */
export default class GatherWaters extends Objective {

	constructor(private readonly waterContainers: Item[], private readonly options?: IGatherWaterOptions) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaters:${this.waterContainers?.join(",")}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.disallowRecipe}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWaterStill}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return this.waterContainers.map(waterContainer => ([new GatherWater(waterContainer, this.options)]));
	}
}

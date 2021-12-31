import Stream from "@wayward/goodstream/Stream";
import Item from "game/item/Item";
import { ListEnder } from "language/ITranslation";
import Translation from "language/Translation";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import GatherWater, { IGatherWaterOptions } from "./GatherWater";


/**
 * Gathers water into one of the containers
 * The water may be unpurified
 */
export default class GatherWaters extends Objective {

	constructor(private readonly waterContainers: Item[], private readonly options?: Partial<IGatherWaterOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaters:${this.waterContainers?.join(",")}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.disallowRecipe}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWaterStill}`;
	}

	public getStatus(): string | undefined {
		const translation = Stream.values(this.waterContainers.map(item => item.getName()))
			.collect(Translation.formatList, ListEnder.Or);

		return `Gathering water into ${translation.getString()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return this.waterContainers.map(waterContainer => ([new GatherWater(waterContainer, this.options)]));
	}
}

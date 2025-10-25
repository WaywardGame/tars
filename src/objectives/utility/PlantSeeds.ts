import type Item from "@wayward/game/game/item/Item";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class PlantSeeds extends Objective {

	constructor(private readonly seeds: Item[]) {
		super();
	}

	public getIdentifier(): string {
		return `PlantSeeds:${this.seeds.join(",")}`;
	}

	public getStatus(): string | undefined {
		return "Planting seeds";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const { Restart, PlantSeed } = context.objectives;

		for (const seed of this.seeds) {
			objectivePipelines.push([
				new PlantSeed(seed),
				new Restart(), // there might be more seeds to plant, so restart after
			]);
		}

		return objectivePipelines;
	}

}

import Doodad from "@wayward/game/game/doodad/Doodad";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import HarvestDoodad from "./HarvestDoodad";

export default class HarvestDoodads extends Objective {

	constructor(private readonly doodads: Doodad[]) {
		super();
	}

	public getIdentifier(): string {
		return `HarvestDoodads:${this.doodads.map(doodad => doodad.toString()).join(",")}`;
	}

	public getStatus(): string | undefined {
		return `Harvesting from ${this.doodads.length} objects`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const doodad of this.doodads) {
			objectivePipelines.push([new HarvestDoodad(doodad)]);
		}

		return objectivePipelines;
	}

}

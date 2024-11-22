import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import WorldZ from "@wayward/utilities/game/WorldZ";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

export default class MoveToZ extends Objective {

	constructor(private readonly z: WorldZ) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToZ:${this.z}`;
	}

	public getStatus(): string | undefined {
		return `Moving to ${WorldZ[this.z]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.z === this.z) {
			return ObjectiveResult.Complete;
		}

		const objectivePipelines: IObjective[][] = [];

		const tileLocations = context.utilities.tile.getNearestTileLocation(context, TerrainType.CaveEntrance);

		for (const tileLocation of tileLocations) {
			objectivePipelines.push([
				new MoveToTarget(tileLocation.tile, false, { ascendDescend: true, changeZ: tileLocation.tile.z === WorldZ.Surface ? WorldZ.Cave : WorldZ.Surface }),
			]);
		}

		return objectivePipelines;
	}

}

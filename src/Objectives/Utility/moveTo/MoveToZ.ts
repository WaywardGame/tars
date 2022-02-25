import { TerrainType } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import Vector3 from "utilities/math/Vector3";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import SetContextData from "../../contextData/SetContextData";
import MoveToTarget from "../../core/MoveToTarget";

/**
 * todo: fix this or remove
 */
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

		const tileLocations = await context.utilities.tile.getNearestTileLocation(context, TerrainType.CaveEntrance);

		for (const tileLocation of tileLocations) {
			objectivePipelines.push([
				new MoveToTarget(tileLocation.point, false, { idleIfAlreadyThere: true }),
				new SetContextData(ContextDataType.Position, new Vector3(tileLocation.point.x, tileLocation.point.y, tileLocation.point.z === WorldZ.Overworld ? WorldZ.Cave : WorldZ.Overworld)),
			]);
		}

		return objectivePipelines;
	}

}

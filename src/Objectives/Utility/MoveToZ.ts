import { TerrainType } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";

import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { getNearestTileLocation } from "../../Utilities/Tile";
import SetContextData from "../ContextData/SetContextData";
import MoveToTarget from "../Core/MoveToTarget";

export default class MoveToZ extends Objective {

	constructor(private readonly z: number) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToZ:${this.z}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.player.z === this.z) {
			return ObjectiveResult.Complete;
		}

		const objectivePipelines: IObjective[][] = [];

		const tileLocations = await getNearestTileLocation(context, TerrainType.CaveEntrance);

		for (const tileLocation of tileLocations) {
			objectivePipelines.push([
				new MoveToTarget(tileLocation.point, false),
				new SetContextData(ContextDataType.Position, {
					x: tileLocation.point.x,
					y: tileLocation.point.y,
					z: tileLocation.point.z === WorldZ.Overworld ? WorldZ.Cave : WorldZ.Overworld,
				}),
			]);
		}

		return objectivePipelines;
	}

}

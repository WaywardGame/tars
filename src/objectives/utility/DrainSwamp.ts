import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Restart from "../core/Restart";
import DigTile from "../other/tile/DigTile";

export default class DrainSwamp extends Objective {

	constructor(private readonly tiles: Tile[]) {
		super();
	}

	public getIdentifier(): string {
		return "DrainSwamp";
	}

	public getStatus(): string | undefined {
		return "Draining swamp";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.tiles.length === 0) {
			return ObjectiveResult.Ignore;
		}

		const objectivePipelines: IObjective[][] = [];

		// restart after digging because there's probably more tiles
		for (const target of this.tiles) {
			objectivePipelines.push([
				new DigTile(target, { digUntilTypeIsNot: TerrainType.Swamp }),
				new Restart(),
			]);
		}

		return objectivePipelines;
	}

}

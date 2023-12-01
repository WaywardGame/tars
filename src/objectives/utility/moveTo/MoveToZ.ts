/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import { WorldZ } from "@wayward/utilities/game/WorldZ";

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
				new MoveToTarget(tileLocation.tile, false, { idleIfAlreadyThere: true, changeZ: tileLocation.tile.z === WorldZ.Overworld ? WorldZ.Cave : WorldZ.Overworld }),
			]);
		}

		return objectivePipelines;
	}

}

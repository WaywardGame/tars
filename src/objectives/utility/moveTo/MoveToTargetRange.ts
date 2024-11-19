import { Direction } from "@wayward/game/utilities/math/Direction";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";
import Vector2 from "@wayward/game/utilities/math/Vector2";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

/**
 * Moves to a target while maintaining a specific range from it
 */
export default class MoveToTargetRange extends Objective {

	constructor(private readonly target: IVector3, private readonly minRange: number, private readonly maxRange: number) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToTargetRange:(${this.target.x},${this.target.y},${this.target.z}):${this.minRange}:${this.maxRange}`;
	}

	public getStatus(): string | undefined {
		return `Moving to target within range ${this.minRange} - ${this.maxRange}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const navigation = context.utilities.navigation;
		const rangeDelta = this.maxRange - this.minRange;

		// check each direction manually instead of flood filling via TileHelpers.findMatchingTile
		for (const direction of Direction.CARDINALS) {
			const point = Vector2.DIRECTIONS[direction];

			for (let i = 0; i <= rangeDelta; i++) {
				const targetPoint = new Vector2(this.target).add(new Vector2(point).multiply(this.minRange + i));

				const targetTile = context.island.getTileSafe(targetPoint.x, targetPoint.y, this.target.z);
				if (!targetTile) {
					continue;
				}

				if (navigation.isDisabled(targetTile)) {
					continue;
				}

				objectivePipelines.push([new MoveToTarget(targetTile, false)]);
			}
		}

		return objectivePipelines;
	}

}

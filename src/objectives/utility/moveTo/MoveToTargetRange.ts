import { Direction } from "utilities/math/Direction";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";

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
                console.log(`checking ${this.target.x},${this.target.y},${this.target.z}, ${targetPoint.toString()}`);

                const validPoint = context.island.ensureValidPoint(targetPoint);
                if (!validPoint) {
                    continue;
                }

                const targetPointZ = { x: validPoint.x, y: validPoint.y, z: this.target.z };

                if (navigation.isDisabledFromPoint(context.island, targetPointZ)) {
                    continue;
                }

                objectivePipelines.push([new MoveToTarget(targetPointZ, false)]);
            }
        }

        return objectivePipelines;
    }

}

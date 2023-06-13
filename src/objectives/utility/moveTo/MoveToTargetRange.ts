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

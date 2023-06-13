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

import Doodad from "game/doodad/Doodad";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import MoveToTarget from "../../core/MoveToTarget";
import Restart from "../../core/Restart";
import ClearTile from "../tile/ClearTile";

export default class HarvestDoodad extends Objective {

    constructor(private readonly doodad: Doodad) {
        super();
    }

    public getIdentifier(): string {
        return `HarvestDoodad:${this.doodad}`;
    }

    public getStatus(): string | undefined {
        return `Harvesting from ${this.doodad.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const growingStage = this.doodad.growth;

        const harvestLoot = growingStage !== undefined ? this.doodad.description?.harvest?.[growingStage] : growingStage;
        if (harvestLoot === undefined) {
            return ObjectiveResult.Impossible;
        }

        const itemTypes = harvestLoot.map(loot => loot.type);

        return [
            new MoveToTarget(this.doodad, true),
            new ClearTile(this.doodad.tile, { skipDoodad: true }),
            new ExecuteActionForItem(
                ExecuteActionType.Doodad,
                itemTypes,
                {
                    onlyAllowHarvesting: true,
                    onlyGatherWithHands: context.options.harvesterOnlyUseHands,
                    moveAllMatchingItems: true,
                }).setStatus(this),
            new Restart(), // ensures that no other objectives are ran after this one
        ];
    }
}

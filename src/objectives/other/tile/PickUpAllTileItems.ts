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

import Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveItemIntoInventory from "../item/MoveItemIntoInventory";

export default class PickUpAllTileItems extends Objective {

    constructor(private readonly target: Tile) {
        super();
    }

    public getIdentifier(): string {
        return `PickUpAllTileItems:${this.target.x},${this.target.y},${this.target.z}`;
    }

    public getStatus(): string | undefined {
        return `Picking up all items on ${this.target.x},${this.target.y},${this.target.z}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const targetTile = this.target;
        if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
            return ObjectiveResult.Complete;
        }

        return targetTile.containedItems.map(item => new MoveItemIntoInventory(item));
    }

}

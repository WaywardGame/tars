import { ActionType } from "game/entity/action/IAction";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import Restart from "../../core/Restart";

import PickUpAllTileItems from "./PickUpAllTileItems";

export interface IClearTileOptions {
    skipDoodad: boolean;
}

/**
 * Clears things on the tile
 */
export default class ClearTile extends Objective {

    constructor(private readonly target: IVector3, private readonly options?: Partial<IClearTileOptions>) {
        super();
    }

    public getIdentifier(): string {
        return `ClearTile:${this.target.x},${this.target.y},${this.target.z}`;
    }

    public getStatus(): string | undefined {
        return `Clearing tile ${this.target.x},${this.target.y},${this.target.z}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectives: IObjective[] = [
            new PickUpAllTileItems(this.target),
        ];

        const tile = context.island.getTileFromPoint(this.target);

        if (tile.npc || tile.creature || context.human.island.isPlayerAtTile(tile, false, true)) {
            return ObjectiveResult.Impossible;
        }

        const tileType = TileHelpers.getType(tile);
        const terrainDescription = Terrains[tileType];
        if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
            objectives.push(
                new ExecuteAction(ActionType.Mine, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForTerrainGather(context, tileType));
                    return ObjectiveResult.Complete;
                }).setStatus("Destroying terrain"),
                new Restart());
        }

        if (!this.options?.skipDoodad && tile.doodad && !tile.doodad.canPickup(context.human)) {
            objectives.push(
                new ExecuteAction(ActionType.Chop, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForDoodadGather(context, tile.doodad!));
                    return ObjectiveResult.Complete;
                }).setStatus("Destroying doodad"),
                new Restart(),
            );
        }

        if (context.utilities.tile.hasCorpses(tile)) {
            objectives.push(
                new ExecuteAction(ActionType.Butcher, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestTool(context, ActionType.Butcher)!);
                    return ObjectiveResult.Complete;
                }).setStatus("Butchering corpse"),
                new Restart(),
            );
        }

        return objectives;
    }

}

import { IVector3 } from "utilities/math/IVector";
import { TerrainType } from "game/tile/ITerrain";
import { ActionType } from "game/entity/action/IAction";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import DigTile from "../other/tile/DigTile";
import Restart from "../core/Restart";
import ExecuteAction from "../core/ExecuteAction";
import { tileUtilities } from "../../utilities/Tile";

export default class DrainSwamp extends Objective {

    constructor(private readonly tiles: IVector3[]) {
        super();
    }

    public getIdentifier(): string {
        return "DrainSwamp";
    }

    public getStatus(): string {
        return "Draining swamp";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (this.tiles.length === 0) {
            return ObjectiveResult.Ignore;
        }

        const objectivePipelines: IObjective[][] = [];

        // restart after digging because there's probably more tiles
        for (const target of this.tiles) {
            const objectives: IObjective[] = [];

            const tile = game.getTileFromPoint(target);
            if (!tileUtilities.canDig(tile)) {
                if (!tileUtilities.hasItems(tile)) {
                    continue;
                }

                for (const item of tile.containedItems!) {
                    objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, context.player.inventory);
                    }));
                }
            }

            objectives.push(new DigTile(target, { digUntilTypeIsNot: TerrainType.Swamp }), new Restart());

            objectivePipelines.push(objectives);
        }

        return objectivePipelines;
    }

}

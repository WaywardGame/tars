import type { IVector3 } from "utilities/math/IVector";
import { TerrainType } from "game/tile/ITerrain";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import DigTile from "../other/tile/DigTile";
import Restart from "../core/Restart";
import PickUpAllTileItems from "../other/tile/PickUpAllTileItems";

export default class DrainSwamp extends Objective {

    constructor(private readonly tiles: IVector3[]) {
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
            const objectives: IObjective[] = [];

            const tile = context.island.getTileFromPoint(target);
            if (!context.utilities.tile.canDig(context, tile)) {
                if (!context.utilities.tile.hasItems(tile)) {
                    continue;
                }

                objectives.push(new PickUpAllTileItems(target));
            }

            objectives.push(new DigTile(target, { digUntilTypeIsNot: TerrainType.Swamp }), new Restart());

            objectivePipelines.push(objectives);
        }

        return objectivePipelines;
    }

}

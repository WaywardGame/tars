import { TurnMode } from "game/IGame";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import type { ITarsMode } from "../core/mode/IMode";
import HarvestDoodads from "../objectives/other/doodad/HarvestDoodads";

export class HarvesterMode implements ITarsMode {

    private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        const doodads = context.utilities.object.findDoodads(context, "Harvester", doodad => doodad.canHarvest(), 10);
        if (doodads.length > 0) {
            objectives.push(new HarvestDoodads(doodads));
        }

        if (!multiplayer.isConnected()) {
            if (game.getTurnMode() !== TurnMode.RealTime) {
                objectives.push(new Lambda(async () => {
                    this.finished(true);
                    return ObjectiveResult.Complete;
                }));

            } else {
                objectives.push(new Idle());
            }
        }

        return objectives;
    }
}

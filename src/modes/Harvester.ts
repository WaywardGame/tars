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

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import HarvestDoodads from "../objectives/other/doodad/HarvestDoodads";
import { BaseMode } from "./BaseMode";

export class HarvesterMode extends BaseMode implements ITarsMode {

    // private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        // this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        const doodads = context.utilities.object.findDoodads(context, "Harvester", doodad => doodad.canHarvest(), 10);
        if (doodads.length > 0) {
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            objectives.push(new HarvestDoodads(doodads));
        }

        // if (!multiplayer.isConnected()) {
        //     if (game.getTurnMode() !== TurnMode.RealTime) {
        //         objectives.push(new Lambda(async () => {
        //             this.finished(true);
        //             return ObjectiveResult.Complete;
        //         }));

        //     } else {
        //         objectives.push(new Idle());
        //     }
        // }

        return objectives;
    }
}

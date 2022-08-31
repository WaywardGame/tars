import { TurnMode } from "game/IGame";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import CompleteQuests from "../objectives/quest/CompleteQuests";
import type { ITarsMode } from "../core/mode/IMode";
import { getCommonInitialObjectives } from "./CommonInitialObjectives";

export class QuestMode implements ITarsMode {

    private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        objectives.push(...await getCommonInitialObjectives(context));

        objectives.push(new CompleteQuests());

        objectives.push(new MoveToBase());

        objectives.push(new OrganizeInventory());

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

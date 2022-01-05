import { TurnMode } from "game/IGame";

import Context from "../core/context/Context";
import { IObjective, ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import ReturnToBase from "../objectives/other/ReturnToBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import CompleteQuests from "../objectives/quest/CompleteQuests";
import { getCommonInitialObjectives } from "./CommonInitialObjectives";
import { ITarsMode } from "../core/mode/IMode";

export class QuestMode implements ITarsMode {

    private finished: (success: boolean) => void;

    public async initialize(_: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        const objectives: Array<IObjective | IObjective[]> = [];

        objectives.push(...await getCommonInitialObjectives(context));

        objectives.push(new CompleteQuests());

        objectives.push(new ReturnToBase());

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

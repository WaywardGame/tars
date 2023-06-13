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
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import type { ITarsMode } from "../core/mode/IMode";

export class ExecuteObjectivesMode implements ITarsMode {

    private finished: (success: boolean) => void;

    constructor(private readonly objectives: IObjective[]) {
    }

    public async initialize(context: Context, finished: (success: boolean) => void) {
        this.finished = finished;
    }

    public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
        return [
            ...this.objectives,
            new Lambda(async () => {
                this.finished(true);
                return ObjectiveResult.Complete;
            })
        ];
    }

}

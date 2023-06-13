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
import Objective from "../../../core/objective/Objective";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import StartDripStone from "./waterSource/StartDripStone";
import StartSolarStill from "./waterSource/StartSolarStill";
import StartWaterStillDesalination from "./waterSource/StartWaterStillDesalination";

export default class StartWaterSourceDoodad extends Objective {

    constructor(private readonly doodad: Doodad) {
        super();
    }

    public getIdentifier(): string {
        return `StartWaterSourceDoodad:${this.doodad}`;
    }

    public getStatus(): string | undefined {
        return `Starting ${this.doodad.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (this.doodad.isInGroup(DoodadTypeGroup.Dripstone)) {
            return new StartDripStone(this.doodad);
        }

        if (this.doodad.type === DoodadType.SolarStill) {
            return new StartSolarStill(this.doodad);
        }

        return new StartWaterStillDesalination(this.doodad);
    }

}

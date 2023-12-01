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

import Doodad from "@wayward/game/game/doodad/Doodad";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import HarvestDoodad from "./HarvestDoodad";

export default class HarvestDoodads extends Objective {

    constructor(private readonly doodads: Doodad[]) {
        super();
    }

    public getIdentifier(): string {
        return `HarvestDoodads:${this.doodads.map(doodad => doodad.toString()).join(",")}`;
    }

    public getStatus(): string | undefined {
        return `Harvesting from ${this.doodads.length} objects`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectivePipelines: IObjective[][] = [];

        for (const doodad of this.doodads) {
            objectivePipelines.push([new HarvestDoodad(doodad)]);
        }

        return objectivePipelines;
    }

}

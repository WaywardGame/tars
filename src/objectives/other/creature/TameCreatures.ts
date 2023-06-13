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

import type Creature from "game/entity/creature/Creature";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import TameCreature from "./TameCreature";

export default class TameCreatures extends Objective {

    constructor(private readonly creatures: Creature[]) {
        super();
    }

    public getIdentifier(): string {
        return `TameCreatures:${this.creatures.map(creature => creature.toString()).join(",")}`;
    }

    public getStatus(): string | undefined {
        return "Looking for creature to tame";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectivePipelines: IObjective[][] = [];

        for (const creature of this.creatures) {
            objectivePipelines.push([new TameCreature(creature)]);
        }

        return objectivePipelines;
    }

}

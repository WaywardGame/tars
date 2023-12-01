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

import type Creature from "@wayward/game/game/entity/creature/Creature";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import HuntCreature from "./HuntCreature";

export default class HuntCreatures extends Objective {

    constructor(private readonly creatures: Creature[]) {
        super();
    }

    public getIdentifier(): string {
        return `HuntCreatures:${this.creatures.map(creature => creature.toString()).join(",")}`;
    }

    public getStatus(): string | undefined {
        return `Hunting ${this.creatures.length} creatures`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectivePipelines: IObjective[][] = [];

        for (const creature of this.creatures) {
            objectivePipelines.push([new HuntCreature(creature, true)]);
        }

        return objectivePipelines;
    }

}

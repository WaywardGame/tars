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

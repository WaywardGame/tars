import Creature from "game/entity/creature/Creature";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import HuntCreature from "./HuntCreature";

export default class HuntCreatures extends Objective {

    constructor(private readonly creatures: Creature[]) {
        super();
    }

    public getIdentifier(): string {
        return `HuntCreatures:${this.creatures.map(creature => creature.toString()).join(",")}`;
    }

    public getStatus(): string {
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

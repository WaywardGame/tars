import Creature from "game/entity/creature/Creature";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class TameCreatures extends Objective {
    private readonly creatures;
    constructor(creatures: Creature[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

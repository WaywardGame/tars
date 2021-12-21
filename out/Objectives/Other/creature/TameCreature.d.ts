import Creature from "game/entity/creature/Creature";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class TameCreature extends Objective {
    private readonly creature;
    constructor(creature: Creature);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

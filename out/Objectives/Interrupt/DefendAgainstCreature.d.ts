import Creature from "game/entity/creature/Creature";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class DefendAgainstCreature extends Objective {
    private readonly creature;
    private readonly shouldRunAway;
    constructor(creature: Creature, shouldRunAway: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

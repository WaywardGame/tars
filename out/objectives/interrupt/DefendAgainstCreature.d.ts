import type Creature from "game/entity/creature/Creature";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class DefendAgainstCreature extends Objective {
    private readonly creature;
    private readonly shouldRunAway;
    constructor(creature: Creature, shouldRunAway: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

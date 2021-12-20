import Creature from "game/entity/creature/Creature";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class HuntCreature extends Objective {
    private readonly creature;
    private readonly track;
    constructor(creature: Creature, track: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

import Corpse from "game/entity/creature/corpse/Corpse";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class ButcherCorpse extends Objective {
    private readonly corpse;
    constructor(corpse: Corpse);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

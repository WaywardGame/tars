import type Corpse from "game/entity/creature/corpse/Corpse";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class ButcherCorpse extends Objective {
    private readonly corpse;
    constructor(corpse: Corpse);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

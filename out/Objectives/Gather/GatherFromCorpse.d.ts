import type Context from "../../core/context/Context";
import type { CreatureSearch } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherFromCorpse extends Objective {
    private readonly search;
    readonly gatherObjectivePriority = 600;
    constructor(search: CreatureSearch);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}

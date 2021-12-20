import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { CreatureSearch } from "../../ITars";
import Objective from "../../Objective";
export default class GatherFromCreature extends Objective {
    private readonly search;
    readonly gatherObjectivePriority = 700;
    constructor(search: CreatureSearch);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}

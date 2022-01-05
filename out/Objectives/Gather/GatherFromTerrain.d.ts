import Context from "../../core/context/Context";
import { ITerrainSearch } from "../../core/ITars";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherFromTerrain extends Objective {
    private readonly search;
    readonly gatherObjectivePriority = 200;
    constructor(search: ITerrainSearch[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}

import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { ITerrainSearch } from "../../ITars";
import Objective from "../../Objective";
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

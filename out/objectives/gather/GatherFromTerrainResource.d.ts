import type Context from "../../core/context/Context";
import { ITerrainResourceSearch } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherFromTerrainResource extends Objective {
    private readonly search;
    constructor(search: ITerrainResourceSearch[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private processTerrainLocation;
}

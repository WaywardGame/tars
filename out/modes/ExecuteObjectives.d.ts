import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
export declare class ExecuteObjectivesMode implements ITarsMode {
    private readonly objectives;
    private finished;
    constructor(objectives: IObjective[]);
    initialize(context: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}

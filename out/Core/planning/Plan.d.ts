import type Log from "utilities/Log";
import type Context from "../context/Context";
import type { IObjective, IObjectiveInfo } from "../objective/IObjective";
import type { ExecuteResult, IExecutionTree, IPlan } from "./IPlan";
import type { IPlanner } from "./IPlanner";
export default class Plan implements IPlan {
    private readonly planner;
    private readonly context;
    private readonly objectiveInfo;
    readonly log: Log;
    readonly tree: IExecutionTree;
    readonly objectives: IObjectiveInfo[];
    static getPipelineString(context: Context, objectives: Array<IObjective | IObjective[]> | undefined, cacheHashcodes?: boolean): string;
    constructor(planner: IPlanner, context: Context, objectiveInfo: IObjectiveInfo, objectives: IObjectiveInfo[]);
    getTreeString(root?: IExecutionTree): string;
    execute(preExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined, postExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined): Promise<ExecuteResult>;
    private processTree;
    private createOptimizedExecutionTreeV2;
    private getObjectiveResults;
    private getExecutionTreePosition;
}

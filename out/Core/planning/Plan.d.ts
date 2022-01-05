import Log from "utilities/Log";
import Context from "../context/Context";
import { IObjective, IObjectiveInfo } from "../objective/IObjective";
import { ExecuteResult, IExecutionTree, IPlan } from "./IPlan";
import { IPlanner } from "./IPlanner";
export default class Plan implements IPlan {
    private readonly planner;
    private readonly context;
    private readonly objectiveInfo;
    readonly log: Log;
    readonly tree: IExecutionTree;
    readonly objectives: IObjectiveInfo[];
    constructor(planner: IPlanner, context: Context, objectiveInfo: IObjectiveInfo, objectives: IObjectiveInfo[]);
    getTreeString(root?: IExecutionTree): string;
    execute(preExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined, postExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined): Promise<ExecuteResult>;
    private flattenTree;
    private createExecutionTree;
    private createOptimizedExecutionTree;
    private createOptimizedExecutionTreeV2;
    private getObjectiveResults;
}

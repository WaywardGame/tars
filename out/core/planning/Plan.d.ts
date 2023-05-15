/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
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

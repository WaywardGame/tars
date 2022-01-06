import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
export declare function getCommonInitialObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;

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
import type Context from "../context/Context";
import type { IObjective, ObjectivePipeline } from "../objective/IObjective";
import type { IPlan } from "./IPlan";
export interface IPlanner {
    readonly isCreatingPlan: boolean;
    debug: boolean;
    reset(): void;
    createPlan(context: Context, objective: IObjective): Promise<IPlan | undefined>;
    pickEasiestObjectivePipeline(context: Context, objectives: IObjective[][]): Promise<ObjectivePipeline>;
}

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export interface IAcquireFoodOptions {
    onlyAllowBaseItems: boolean;
    allowDangerousFoodItems: boolean;
}
export default class AcquireFood extends Objective {
    private readonly options?;
    constructor(options?: Partial<IAcquireFoodOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getFoodRecipeObjectivePipelines(context: Context, eatFood: boolean): IObjective[][];
}

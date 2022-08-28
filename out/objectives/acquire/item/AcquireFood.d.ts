import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class AcquireFood extends Objective {
    private readonly allowDangerousFoodItems;
    constructor(allowDangerousFoodItems?: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getFoodRecipeObjectivePipelines(context: Context, eatFood: boolean): IObjective[][];
}

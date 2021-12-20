import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class AcquireFood extends Objective {
    private readonly allowDangerousFoodItems;
    constructor(allowDangerousFoodItems?: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getFoodRecipeObjectivePipelines(context: Context, eatFood: boolean): IObjective[][];
}

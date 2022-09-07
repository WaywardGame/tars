import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveToWater extends Objective {
    private readonly ocean;
    private readonly allowBoat;
    constructor(ocean?: boolean, allowBoat?: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

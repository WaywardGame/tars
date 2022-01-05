import { IVector3 } from "utilities/math/IVector";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class DrainSwamp extends Objective {
    private readonly tiles;
    constructor(tiles: IVector3[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

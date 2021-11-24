import { IVector3 } from "utilities/math/IVector";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class DrainSwamp extends Objective {
    private readonly tiles;
    constructor(tiles: IVector3[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

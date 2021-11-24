import { IVector3 } from "utilities/math/IVector";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class PickUpAllTileItems extends Objective {
    private readonly target;
    constructor(target: IVector3);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

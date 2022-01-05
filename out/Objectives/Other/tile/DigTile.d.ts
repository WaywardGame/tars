import { IVector3 } from "utilities/math/IVector";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class DigTile extends Objective {
    private readonly target;
    private options;
    constructor(target: IVector3, options?: Partial<{
        digUntilTypeIsNot: TerrainType;
    }>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

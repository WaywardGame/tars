import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export interface IClearTileOptions {
    skipDoodad: boolean;
}
export default class ClearTile extends Objective {
    private readonly target;
    private readonly options?;
    constructor(target: IVector3, options?: Partial<IClearTileOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

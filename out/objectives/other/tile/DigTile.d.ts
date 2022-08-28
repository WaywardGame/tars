import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export interface IDigTileOptions {
    digUntilTypeIsNot: TerrainType;
}
export default class DigTile extends Objective {
    private readonly target;
    private readonly options?;
    constructor(target: IVector3, options?: Partial<IDigTileOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
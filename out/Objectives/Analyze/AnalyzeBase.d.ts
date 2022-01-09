import type Doodad from "game/doodad/Doodad";
import type { DoodadType } from "game/doodad/IDoodad";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IBaseInfo } from "../../core/ITars";
export default class AnalyzeBase extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getNearPoints(doodads: Doodad[]): IVector3[];
    static matchesBaseInfo(info: IBaseInfo, doodadType: DoodadType): boolean;
}

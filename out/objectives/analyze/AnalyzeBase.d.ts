import type Doodad from "game/doodad/Doodad";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class AnalyzeBase extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getNearPointsFromDoodads(doodads: Doodad[]): IVector3[];
    static getNearPoints(point: IVector3): IVector3[];
}

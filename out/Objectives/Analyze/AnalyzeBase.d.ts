import Doodad from "game/doodad/Doodad";
import { DoodadType } from "game/doodad/IDoodad";
import { IVector3 } from "utilities/math/IVector";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IBaseInfo } from "../../core/ITars";
export default class AnalyzeBase extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getNearPoints(doodads: Doodad[]): IVector3[];
    static matchesBaseInfo(info: IBaseInfo, doodadType: DoodadType): boolean;
}

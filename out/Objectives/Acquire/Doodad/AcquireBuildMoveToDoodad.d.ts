import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class AcquireBuildMoveToDoodad extends Objective {
    private readonly doodadTypeOrGroup;
    constructor(doodadTypeOrGroup: DoodadType | DoodadTypeGroup);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

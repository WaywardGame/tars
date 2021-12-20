import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export interface IAcquireBuildMoveToDoodadOptions {
    ignoreExistingDoodads: boolean;
    disableMoveTo: boolean;
}
export default class AcquireBuildMoveToDoodad extends Objective {
    private readonly doodadTypeOrGroup;
    private readonly options;
    constructor(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, options?: Partial<IAcquireBuildMoveToDoodadOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

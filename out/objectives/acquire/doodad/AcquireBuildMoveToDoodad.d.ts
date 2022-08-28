import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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

import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class AcquireItemForDoodad extends Objective {
    private readonly doodadTypeOrGroup;
    private static readonly cache;
    constructor(doodadTypeOrGroup: DoodadType | DoodadTypeGroup);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(): Promise<ObjectiveExecutionResult>;
    private getItems;
}

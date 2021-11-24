import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
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

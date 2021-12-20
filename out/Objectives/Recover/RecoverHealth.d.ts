import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class RecoverHealth extends Objective {
    private readonly onlyUseAvailableItems;
    private saveChildObjectives;
    constructor(onlyUseAvailableItems: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canSaveChildObjectives(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

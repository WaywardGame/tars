import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class RecoverHealth extends Objective {
    private readonly onlyUseAvailableItems;
    private saveChildObjectives;
    constructor(onlyUseAvailableItems: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canSaveChildObjectives(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

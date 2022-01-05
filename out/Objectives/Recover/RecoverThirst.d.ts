import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IRecoverThirstOptions {
    onlyUseAvailableItems: boolean;
    exceededThreshold: boolean;
    onlyEmergencies: boolean;
}
export default class RecoverThirst extends Objective {
    private readonly options;
    constructor(options: IRecoverThirstOptions);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getEmergencyObjectives;
    private getBelowThresholdObjectives;
}

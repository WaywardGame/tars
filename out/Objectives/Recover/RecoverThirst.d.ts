import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
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

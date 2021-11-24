import { IRequirementInfo } from "game/item/IItemManager";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class CompleteRequirements extends Objective {
    private readonly requirementInfo;
    constructor(requirementInfo: IRequirementInfo);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

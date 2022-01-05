import Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class CopyContextData<T extends ContextDataType, T2 extends ContextDataType> extends Objective {
    private readonly source;
    private readonly destination;
    constructor(source: T, destination: T2);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

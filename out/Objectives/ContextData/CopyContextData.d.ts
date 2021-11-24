import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class CopyContextData<T extends ContextDataType, T2 extends ContextDataType> extends Objective {
    private readonly source;
    private readonly destination;
    constructor(source: T, destination: T2);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}

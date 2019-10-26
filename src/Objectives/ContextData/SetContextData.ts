import Context, { ContextDataMap, ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class SetContextData<T extends ContextDataType> extends Objective {

	constructor(private readonly type: T, private readonly value: ContextDataMap<T> | undefined) {
		super();
	}

	public getIdentifier(): string {
		return `SetContextData:${this.type}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.setData(this.type, this.value);
		this.log.info(`Set ${this.type} to ${this.value}`);
		return ObjectiveResult.Complete;
	}

}

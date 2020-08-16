import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class SetContextData extends Objective {

	constructor(private readonly type: string, private readonly value: any | undefined) {
		super();
	}

	public getIdentifier(): string {
		return `SetContextData:${this.type}:${this.value}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.setData(this.type, this.value);
		return ObjectiveResult.Complete;
	}

}

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class SetContextData extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly type: string, private readonly value: any | undefined) {
		super();
	}

	public getIdentifier(): string {
		return `SetContextData:${this.type}=${this.value}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.setData(this.type, this.value);
		return ObjectiveResult.Complete;
	}

}

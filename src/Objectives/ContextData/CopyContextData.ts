import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class CopyContextData<T extends ContextDataType, T2 extends ContextDataType> extends Objective {

	constructor(private readonly destination: T, private readonly source: T2) {
		super();
	}

	public getIdentifier(): string {
		return `CopyContextData:${this.source},${this.destination}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const data = context.getData(this.source);
		context.setData(this.destination, data as any);
		this.log.info(`Copied ${data} from ${this.source} to ${this.destination}`);
		return ObjectiveResult.Complete;
	}

}

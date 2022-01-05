import Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class CopyContextData<T extends ContextDataType, T2 extends ContextDataType> extends Objective {

	constructor(private readonly source: T, private readonly destination: T2) {
		super();
	}

	public getIdentifier(): string {
		return `CopyContextData:${ContextDataType[this.source]},${ContextDataType[this.destination]}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const data = context.getData(this.source);
		context.setData(this.destination, data);
		// console.log(`Copied ${data} from ${ContextDataType[this.source]} to ${ContextDataType[this.destination]}`);
		this.log.info(`Copied ${data} from ${ContextDataType[this.source]} to ${ContextDataType[this.destination]}`);
		return ObjectiveResult.Complete;
	}

}

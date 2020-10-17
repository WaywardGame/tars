
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";

export default class Lambda extends Objective {

	constructor(private readonly lambda: (context: Context, lambda: Lambda) => Promise<ObjectiveExecutionResult>, private readonly difficulty = 1) {
		super();
	}

	public getIdentifier(): string {
		return "Lambda";
	}

	public getStatus(): string {
		return "Miscellaneous processing";
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return this.difficulty;
		}

		return this.lambda(context, this);
	}

}

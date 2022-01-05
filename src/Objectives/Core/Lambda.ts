
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class Lambda extends Objective {

	constructor(private readonly lambda: (context: Context, lambda: Lambda) => Promise<ObjectiveExecutionResult>, private readonly difficulty = 1) {
		super();
	}

	public getIdentifier(): string {
		return "Lambda";
	}

	public getStatus(): string | undefined {
		return "Miscellaneous processing";
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return this.difficulty;
		}

		return this.lambda(context, this);
	}

}

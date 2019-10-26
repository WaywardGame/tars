import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

export default class AddDifficulty extends Objective {

	constructor(private readonly difficulty: number) {
		super();
	}

	public getIdentifier(): string {
		return "AddDifficulty";
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return this.difficulty;
		}

		return ObjectiveResult.Complete;
	}

}

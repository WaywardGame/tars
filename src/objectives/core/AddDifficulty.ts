import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class AddDifficulty extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly difficulty: number) {
		super();
	}

	public getIdentifier(): string {
		return `AddDifficulty:${this.difficulty}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return this.difficulty;
		}

		return ObjectiveResult.Complete;
	}

}

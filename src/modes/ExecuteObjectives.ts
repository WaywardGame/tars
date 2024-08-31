import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import type { ITarsMode } from "../core/mode/IMode";

export class ExecuteObjectivesMode implements ITarsMode {

	private finished: (success: boolean) => void;

	constructor(private readonly objectives: IObjective[]) {
	}

	public async initialize(context: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		return [
			...this.objectives,
			new Lambda(async () => {
				this.finished(true);
				return ObjectiveResult.Complete;
			})
		];
	}

}

import ActionExecutor from "entity/action/ActionExecutor";
import actionDescriptions from "entity/action/Actions";
import { ActionType, IActionDescription } from "entity/action/IAction";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { executeAction } from "../../Utilities/Action";

export default class ExecuteAction<T extends ActionType> extends Objective {

	constructor(
		private readonly actionType: T,
		private readonly executor: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never)) => void) {
		super();
	}

	public getIdentifier(): string {
		return `ExecuteAction:${ActionType[this.actionType]}`;
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		await executeAction(context, this.actionType, this.executor as any);

		return ObjectiveResult.Complete;
	}

	protected getBaseDifficulty(context: Context): number {
		return 1;
	}
}

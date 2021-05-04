import ActionExecutor from "game/entity/action/ActionExecutor";
import actionDescriptions from "game/entity/action/Actions";
import { ActionType, IActionDescription } from "game/entity/action/IAction";
import { Dictionary } from "language/Dictionaries";
import Translation, { TextContext } from "language/Translation";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { executeAction } from "../../Utilities/Action";

export default class ExecuteAction<T extends ActionType> extends Objective {

	constructor(
		private readonly actionType: T,
		private readonly executor: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never)) => void) {
		super();
	}

	public getIdentifier(): string {
		return `ExecuteAction:${ActionType[this.actionType]}`;
	}

	public getStatus(): string {
		return `Executing ${Translation.nameOf(Dictionary.Action, this.actionType).inContext(TextContext.Lowercase).getString()} action`;
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

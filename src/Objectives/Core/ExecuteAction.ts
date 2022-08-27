import type { AnyActionDescription } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import Dictionary from "language/Dictionary";
import Message from "language/dictionary/Message";
import { TextContext } from "language/ITranslation";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { GetActionArguments } from "../../utilities/Action";

export default class ExecuteAction<T extends AnyActionDescription> extends Objective {

	protected override includeUniqueIdentifierInHashCode = true;

	constructor(
		private readonly action: T,
		private readonly args: GetActionArguments<T>,
		private readonly expectedMessages?: Set<Message>,
		private readonly expectedCannotUseResult?: ObjectiveResult) {
		super();
	}

	public getIdentifier(): string {
		return `ExecuteAction:${ActionType[this.action.type!]}`;
	}

	public getStatus(): string | undefined {
		return `Executing ${Translation.nameOf(Dictionary.Action, this.action.type!).inContext(TextContext.Lowercase).getString()} action`;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		return context.utilities.action.executeAction(context, this.action, this.args, this.expectedMessages, this.expectedCannotUseResult);
	}

	protected override getBaseDifficulty(context: Context): number {
		return 1;
	}
}

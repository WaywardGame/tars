/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type { AnyActionDescription } from "@wayward/game/game/entity/action/IAction";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import Dictionary from "@wayward/game/language/Dictionary";
import Message from "@wayward/game/language/dictionary/Message";
import { TextContext } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { GetActionArguments } from "../../utilities/ActionUtilities";

export default class ExecuteAction<T extends AnyActionDescription> extends Objective {

	protected override readonly includeUniqueIdentifierInHashCode: boolean = true;

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

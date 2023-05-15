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

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class Lambda extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	protected override readonly includeUniqueIdentifierInHashCode: boolean = true;

	constructor(private readonly lambda: (context: Context, lambda: Lambda) => Promise<ObjectiveExecutionResult>, private readonly difficulty = 1) {
		super();
	}

	public getIdentifier(): string {
		return `Lambda:${this.difficulty}`;
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

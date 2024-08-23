/*!
 * Copyright 2011-2024 Unlok
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
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class SetContextData extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly type: string, private readonly value: any | undefined) {
		super();
	}

	public getIdentifier(): string {
		return `SetContextData:${this.type}=${this.value}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.setData(this.type, this.value);
		return ObjectiveResult.Complete;
	}

}

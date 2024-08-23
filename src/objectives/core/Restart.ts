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

import { ObjectiveResult } from "../../core/objective/IObjective";
import Lambda from "./Lambda";

export default class Restart extends Lambda {

	public override readonly includePositionInHashCode: boolean = false;

	protected override readonly includeUniqueIdentifierInHashCode: boolean = false;

	constructor() {
		super(async () => ObjectiveResult.Restart);
	}

	public override getIdentifier(): string {
		return "Restart";
	}

}

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

import { WeightStatus } from "@wayward/game/game/entity/player/IPlayer";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IOriganizeInventoryOptions } from "../utility/OrganizeInventory";
import OrganizeInventory from "../utility/OrganizeInventory";

export default class ReduceWeight extends Objective {

	constructor(private readonly options: Partial<IOriganizeInventoryOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return "ReduceWeight";
	}

	public getStatus(): string | undefined {
		return "Reducing weight";
	}

	public override canSaveChildObjectives(): boolean {
		return false;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const weightStatus = context.human.getWeightStatus();
		if (weightStatus === WeightStatus.None) {
			return ObjectiveResult.Ignore;
		}

		return new OrganizeInventory({
			allowChests: weightStatus !== WeightStatus.Overburdened,
			...this.options,
		});
	}

}

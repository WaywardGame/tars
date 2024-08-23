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

import { ItemType } from "@wayward/game/game/item/IItem";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

/**
 * Provides items that can be used by other objectives
 */
export default class ProvideItems extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	public itemTypes: ItemType[];

	constructor(...itemTypes: ItemType[]) {
		super();

		this.itemTypes = itemTypes;
	}

	public getIdentifier(): string {
		return `ProvideItems:${this.itemTypes.map(itemType => ItemType[itemType]).join(",")}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.addProvidedItems(this.itemTypes);
		return ObjectiveResult.Complete;
	}

}

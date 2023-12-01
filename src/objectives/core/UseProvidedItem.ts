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

import { ItemType } from "@wayward/game/game/item/IItem";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

/**
 * Trys to use a provided item
 */
export default class UseProvidedItem extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getIdentifier(context: Context | undefined): string {
		return `UseProvidedItem:${ItemType[this.itemType]}:${context?.state.providedItems?.get(this.itemType)}`;
	}

	public getStatus(): string | undefined {
		return `Using ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
	}

	public override canIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean {
		return true;
		// return {
		//     objectiveHashCode,
		//     itemTypes: new Set([this.itemType]),
		// };
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return context.isReservedItemType(this.itemType);
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return context.tryUseProvidedItems(this.itemType) ? ObjectiveResult.Complete : ObjectiveResult.Impossible;
	}

}

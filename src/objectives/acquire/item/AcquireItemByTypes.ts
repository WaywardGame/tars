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
import { ListEnder } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByTypes extends AcquireBase {

	constructor(private readonly itemTypes: ItemType[]) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemByTypes:${this.itemTypes.map(itemType => ItemType[itemType]).join(",")}`;
	}

	public getStatus(): string | undefined {
		const itemTypesString = this.itemTypes
			.map(itemType => Translation.nameOf(Dictionary.Item, itemType))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${itemTypesString}`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.itemTypes.some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return this.itemTypes
			.map(item => [new AcquireItem(item).passAcquireData(this)]);
	}

}

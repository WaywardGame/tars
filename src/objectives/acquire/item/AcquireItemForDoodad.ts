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

import DoodadManager from "@wayward/game/game/doodad/DoodadManager";
import { DoodadType, DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import { ItemType } from "@wayward/game/game/item/IItem";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import Enums from "@wayward/game/utilities/enum/Enums";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireItemForDoodad extends Objective {

	private static readonly cache: Map<DoodadType | DoodadTypeGroup, ItemType[]> = new Map();

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemForDoodad:${DoodadManager.isGroup(this.doodadTypeOrGroup) ? DoodadTypeGroup[this.doodadTypeOrGroup] : DoodadType[this.doodadTypeOrGroup]}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${DoodadManager.isGroup(this.doodadTypeOrGroup) ? Translation.nameOf(Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation.nameOf(Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.getItems(context).some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		// min dur of 1 is required to build doodads
		return this.getItems(context)
			.map(item => [new AcquireItem(item, { requiredMinDur: 1 }).passAcquireData(this)]);
	}

	private getItems(context: Context): ItemType[] {
		let result = AcquireItemForDoodad.cache.get(this.doodadTypeOrGroup);
		if (result === undefined) {
			result = [];

			const doodadTypes = context.utilities.doodad.getDoodadTypes(this.doodadTypeOrGroup);
			for (const doodadType of doodadTypes) {
				for (const itemType of Enums.values(ItemType)) {
					const itemDescription = itemDescriptions[itemType];
					if (itemDescription && itemDescription.onUse &&
						(itemDescription.onUse[ActionType.Build]?.type === doodadType || itemDescription.onUse[ActionType.PlaceDown]?.type === doodadType)) {
						result.push(itemType);
					}
				}
			}

			AcquireItemForDoodad.cache.set(this.doodadTypeOrGroup, result);
		}

		return result;
	}
}

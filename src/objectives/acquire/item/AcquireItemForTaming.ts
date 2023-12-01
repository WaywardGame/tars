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

import type { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import type { ItemType } from "@wayward/game/game/item/IItem";
import type Creature from "@wayward/game/game/entity/creature/Creature";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireItemForTaming extends Objective {

	private static readonly cache: Map<CreatureType, ItemType[]> = new Map();

	constructor(private readonly creature: Creature) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemForTaming:${this.creature}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring an item to use for taming ${this.creature.getName()}`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return AcquireItemForTaming.getItems(context, this.creature).some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return AcquireItemForTaming.getItems(context, this.creature)
			.map(item => [new AcquireItem(item, { requirePlayerCreatedIfCraftable: true }).passAcquireData(this)]);
	}

	public static getItems(context: Context, creature: Creature): ItemType[] {
		let result = AcquireItemForTaming.cache.get(creature.type);
		if (result === undefined) {
			result = [];

			const acceptedItems = creature.description?.acceptedItems;
			if (acceptedItems) {
				for (const itemTypeOrGroup of acceptedItems) {
					if (context.island.items.isGroup(itemTypeOrGroup)) {
						result = result.concat(Array.from(context.island.items.getGroupItems(itemTypeOrGroup)));

					} else {
						result.push(itemTypeOrGroup);
					}
				}
			}

			AcquireItemForTaming.cache.set(creature.type, result);
		}

		return result;
	}
}

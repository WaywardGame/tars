import { CreatureType } from "game/entity/creature/ICreature";
import { ItemType } from "game/item/IItem";
import Creature from "game/entity/creature/Creature";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
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

			const acceptedItems = creature.description()?.acceptedItems;
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

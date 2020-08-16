import Creature from "entity/creature/Creature";
import { CreatureType } from "entity/creature/ICreature";
import { EquipType } from "entity/IHuman";
import { ItemType } from "item/IItem";

import Context from "../Context";

export function isScaredOfCreature(context: Context, creature: Creature) {
	return isScaredOfCreatureType(context, creature.type);
}

export function isScaredOfCreatureType(context: Context, type: CreatureType) {
	switch (type) {
		case CreatureType.Shark:
			return !hasDecentEquipment(context);

		case CreatureType.Kraken:
			return !hasDecentEquipment(context)
				&& context.player.getEquippedItem(EquipType.Legs)!.type !== ItemType.BarkLeggings
				&& context.player.getEquippedItem(EquipType.Chest)!.type !== ItemType.BarkTunic;
	}

	return false;
}

function hasDecentEquipment(context: Context): boolean {
	const chest = context.player.getEquippedItem(EquipType.Chest);
	const legs = context.player.getEquippedItem(EquipType.Legs);
	const belt = context.player.getEquippedItem(EquipType.Belt);
	const neck = context.player.getEquippedItem(EquipType.Neck);
	const head = context.player.getEquippedItem(EquipType.Head);
	const feet = context.player.getEquippedItem(EquipType.Feet);
	const hands = context.player.getEquippedItem(EquipType.Hands);
	return (chest && legs && belt && neck && head && feet && hands) ? true : false;
}

import Creature from "game/entity/creature/Creature";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";
import { IStatMax, Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";

import Context from "../Context";

class CreatureUtilities {

	public readonly creatureRadius = 5;

	public shouldRunAwayFromAllCreatures(context: Context) {
		const health = context.player.stat.get<IStatMax>(Stat.Health);
		const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);

		return context.player.getWeightStatus() !== WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
	}

	public getNearbyCreatures(point: IVector3): Creature[] {
		const creatures: Creature[] = [];

		for (let x = this.creatureRadius * -1; x <= this.creatureRadius; x++) {
			for (let y = this.creatureRadius * -1; y <= this.creatureRadius; y++) {
				const validPoint = game.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
				if (validPoint) {
					const tile = game.getTileFromPoint(validPoint);
					if (tile.creature && !tile.creature.isTamed()) {
						creatures.push(tile.creature);
					}
				}
			}
		}

		return creatures;
	}

	public isScaredOfCreature(context: Context, creature: Creature) {
		return this.isScaredOfCreatureType(context, creature.type);
	}

	public isScaredOfCreatureType(context: Context, type: CreatureType) {
		switch (type) {
			case CreatureType.Shark:
			case CreatureType.Zombie:
				return !this.hasDecentEquipment(context);

			case CreatureType.Kraken:
				return !this.hasDecentEquipment(context) ||
					context.player.getEquippedItem(EquipType.Legs)!.type === ItemType.BarkLeggings ||
					context.player.getEquippedItem(EquipType.Chest)!.type === ItemType.BarkTunic;
		}

		return false;
	}

	private hasDecentEquipment(context: Context): boolean {
		const chest = context.player.getEquippedItem(EquipType.Chest);
		const legs = context.player.getEquippedItem(EquipType.Legs);
		const belt = context.player.getEquippedItem(EquipType.Belt);
		const neck = context.player.getEquippedItem(EquipType.Neck);
		const head = context.player.getEquippedItem(EquipType.Head);
		const feet = context.player.getEquippedItem(EquipType.Feet);
		const hands = context.player.getEquippedItem(EquipType.Hands);
		return (chest && legs && belt && neck && head && feet && hands) ? true : false;
	}
}

export const creatureUtilities = new CreatureUtilities();


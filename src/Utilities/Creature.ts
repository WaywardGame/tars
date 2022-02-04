import type Creature from "game/entity/creature/Creature";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";

import type Context from "../core/context/Context";

export class CreatureUtilities {

	private readonly nearbyCreatureRadius = 5;

	public shouldRunAwayFromAllCreatures(context: Context) {
		const health = context.human.stat.get<IStatMax>(Stat.Health);
		const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);

		return context.human.getWeightStatus() !== WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
	}

	/**
	 * Returns nearby untamed & unhitched creatures
	 */
	public getNearbyCreatures(context: Context): Creature[] {
		const point = context.human;

		const creatures: Creature[] = [];

		for (let x = -this.nearbyCreatureRadius; x <= this.nearbyCreatureRadius; x++) {
			for (let y = -this.nearbyCreatureRadius; y <= this.nearbyCreatureRadius; y++) {
				const validPoint = context.island.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
				if (validPoint) {
					const tile = context.island.getTileFromPoint(validPoint);
					if (tile.creature && !tile.creature.isTamed() && tile.creature.hitchedTo === undefined) {
						creatures.push(tile.creature);
					}
				}
			}
		}

		return creatures;
	}

	public isScaredOfCreature(context: Context, creature: Creature): boolean {
		switch (creature.type) {
			case CreatureType.Shark:
			case CreatureType.Zombie:
				return !this.hasDecentEquipment(context);

			case CreatureType.Kraken:
				return !this.hasDecentEquipment(context) ||
					context.human.getEquippedItem(EquipType.Legs)!.type === ItemType.BarkLeggings ||
					context.human.getEquippedItem(EquipType.Chest)!.type === ItemType.BarkTunic;

			default:
				return creature.aberrant ? !this.hasDecentEquipment(context) : false;
		}
	}

	private hasDecentEquipment(context: Context): boolean {
		const chest = context.human.getEquippedItem(EquipType.Chest);
		const legs = context.human.getEquippedItem(EquipType.Legs);
		const belt = context.human.getEquippedItem(EquipType.Belt);
		const neck = context.human.getEquippedItem(EquipType.Neck);
		const head = context.human.getEquippedItem(EquipType.Head);
		const feet = context.human.getEquippedItem(EquipType.Feet);
		const hands = context.human.getEquippedItem(EquipType.Hands);
		return (chest && legs && belt && neck && head && feet && hands) ? true : false;
	}
}

export const creatureUtilities = new CreatureUtilities();


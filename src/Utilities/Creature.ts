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
		const health = context.player.stat.get<IStatMax>(Stat.Health);
		const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);

		return context.player.getWeightStatus() !== WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
	}

	/**
	 * Returns nearby untamed & unhitched creatures
	 */
	public getNearbyCreatures(context: Context): Creature[] {
		const point = context.player;

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
					context.player.getEquippedItem(EquipType.Legs)!.type === ItemType.BarkLeggings ||
					context.player.getEquippedItem(EquipType.Chest)!.type === ItemType.BarkTunic;

			default:
				return creature.aberrant ? !this.hasDecentEquipment(context) : false;
		}
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


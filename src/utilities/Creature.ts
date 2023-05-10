import type Creature from "game/entity/creature/Creature";
import { CreatureType } from "game/entity/creature/ICreature";
import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";
import { CombatDangerLevel, CombatStrength } from "game/entity/CombatStrengthManager";

import type Context from "../core/context/Context";

export class CreatureUtilities {

	private readonly nearbyCreatureRadius = 5;

	public shouldRunAwayFromAllCreatures(context: Context) {
		const health = context.human.stat.get<IStatMax>(Stat.Health);
		const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);

		return context.human.getWeightStatus() !== WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
	}

	/**
	 * Returns nearby untamed & unhitched creatures that could move to the player
	 */
	public getNearbyCreatures(context: Context, radius = this.nearbyCreatureRadius): Creature[] {
		const point = context.human;

		const creatures: Creature[] = [];

		for (let x = -radius; x <= radius; x++) {
			for (let y = -radius; y <= radius; y++) {
				const creature = context.island.getTileSafe(point.x + x, point.y + y, point.z)?.creature;
				if (creature && !creature.isTamed() && creature.hitchedTo === undefined && creature.findPath(context.human.tile, creature.getMoveType(), 256, context.human) !== undefined) {
					creatures.push(creature);
				}
			}
		}

		return creatures;
	}

	public isScaredOfCreature(context: Context, creature: Creature): boolean {
		const combatStrength = context.island.creatures.combatStrength;

		const creatureTypeStrength = combatStrength.getCreature(creature.type, creature.aberrant);
		const creatureTier = combatStrength.getTier(creatureTypeStrength);
		if (creatureTier <= CombatStrength.Tier4) {
			return false;
		}

		const creatureDifficulty = combatStrength.getCreatureDifficultyAgainstHuman(creature, context.human);
		const creatureDangerLevel = combatStrength.getDangerLevel(creatureDifficulty);
		if (creatureDangerLevel === CombatDangerLevel.VeryHigh || creatureDangerLevel === CombatDangerLevel.Extreme) {
			return true;
		}

		// todo: remove this logic once we trust the stuff above
		switch (creature.type) {
			case CreatureType.Shark:
			case CreatureType.Zombie:
			case CreatureType.Coyote:
				return !this.hasDecentEquipment(context);

			case CreatureType.Kraken:
				return !this.hasDecentEquipment(context) ||
					context.human.getEquippedItem(EquipType.Legs)?.type === ItemType.BarkLeggings ||
					context.human.getEquippedItem(EquipType.Chest)?.type === ItemType.BarkTunic;

			default:
				return creature.aberrant ? !this.hasDecentEquipment(context) : false;
		}
	}

	public hasDecentEquipment(context: Context): boolean {
		const chest = context.human.getEquippedItem(EquipType.Chest) ? 1 : 0;
		const legs = context.human.getEquippedItem(EquipType.Legs) ? 1 : 0;
		const waist = context.human.getEquippedItem(EquipType.Waist) ? 1 : 0;
		const neck = context.human.getEquippedItem(EquipType.Neck) ? 1 : 0;
		const head = context.human.getEquippedItem(EquipType.Head) ? 1 : 0;
		const feet = context.human.getEquippedItem(EquipType.Feet) ? 1 : 0;
		const hands = context.human.getEquippedItem(EquipType.Hands) ? 1 : 0;
		return (chest + legs + waist + neck + head + feet + hands) >= 4 ? true : false;
	}
}

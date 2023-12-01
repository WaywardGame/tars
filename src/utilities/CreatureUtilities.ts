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

import type Creature from "@wayward/game/game/entity/creature/Creature";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import { ItemType } from "@wayward/game/game/item/IItem";
import type { IStatMax } from "@wayward/game/game/entity/IStats";
import { Stat } from "@wayward/game/game/entity/IStats";
import { WeightStatus } from "@wayward/game/game/entity/player/IPlayer";
import { CombatDangerLevel } from "@wayward/game/game/entity/CombatStrengthManager";

import type Context from "../core/context/Context";
import Human from "@wayward/game/game/entity/Human";

export class CreatureUtilities {

	private readonly nearbyCreatureRadius = 5;

	public shouldRunAwayFromAllCreatures(context: Context): boolean {
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
				if (creature && !creature.isTamed && creature.hitchedTo === undefined && creature.findPath(undefined, context.human.tile, creature.getMoveType(), 256, context.human) !== undefined) {
					creatures.push(creature);
				}
			}
		}

		return creatures;
	}

	public isScaredOfCreature(human: Human, creature: Creature): boolean {
		const combatStrength = human.island.creatures.combatStrength;

		// const creatureTypeStrength = combatStrength.getCreature(creature.type, creature.aberrant);
		// const creatureTier = combatStrength.getTier(creatureTypeStrength);
		// if (creatureTier <= CombatStrength.Tier4) {
		// 	return false;
		// }

		const creatureDifficulty = combatStrength.getCreatureDifficultyAgainstHuman(creature, human);
		const creatureDangerLevel = combatStrength.getDangerLevel(creatureDifficulty);
		if (creatureDangerLevel === CombatDangerLevel.VeryHigh || creatureDangerLevel === CombatDangerLevel.Extreme) {
			return true;
		}

		// todo: remove this logic once we trust the stuff above
		switch (creature.type) {
			case CreatureType.Shark:
			case CreatureType.Zombie:
			case CreatureType.Coyote:
				return !this.hasDecentEquipment(human);

			case CreatureType.Kraken:
				return !this.hasDecentEquipment(human) ||
					human.getEquippedItem(EquipType.Legs)?.type === ItemType.BarkLeggings ||
					human.getEquippedItem(EquipType.Chest)?.type === ItemType.BarkTunic;

			default:
				return creature.aberrant ? !this.hasDecentEquipment(human) : false;
		}
	}

	public hasDecentEquipment(human: Human): boolean {
		const chest = human.getEquippedItem(EquipType.Chest) ? 1 : 0;
		const legs = human.getEquippedItem(EquipType.Legs) ? 1 : 0;
		const waist = human.getEquippedItem(EquipType.Waist) ? 1 : 0;
		const neck = human.getEquippedItem(EquipType.Neck) ? 1 : 0;
		const head = human.getEquippedItem(EquipType.Head) ? 1 : 0;
		const feet = human.getEquippedItem(EquipType.Feet) ? 1 : 0;
		const hands = human.getEquippedItem(EquipType.Hands) ? 1 : 0;
		return (chest + legs + waist + neck + head + feet + hands) >= 4 ? true : false;
	}
}

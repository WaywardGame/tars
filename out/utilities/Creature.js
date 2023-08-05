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
define(["require", "exports", "game/entity/creature/ICreature", "game/entity/IHuman", "game/item/IItem", "game/entity/IStats", "game/entity/player/IPlayer", "game/entity/CombatStrengthManager"], function (require, exports, ICreature_1, IHuman_1, IItem_1, IStats_1, IPlayer_1, CombatStrengthManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreatureUtilities = void 0;
    class CreatureUtilities {
        constructor() {
            this.nearbyCreatureRadius = 5;
        }
        shouldRunAwayFromAllCreatures(context) {
            const health = context.human.stat.get(IStats_1.Stat.Health);
            const stamina = context.human.stat.get(IStats_1.Stat.Stamina);
            return context.human.getWeightStatus() !== IPlayer_1.WeightStatus.Overburdened && ((health.value / health.max) <= 0.15 || stamina.value <= 2);
        }
        getNearbyCreatures(context, radius = this.nearbyCreatureRadius) {
            const point = context.human;
            const creatures = [];
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
        isScaredOfCreature(context, creature) {
            const combatStrength = context.island.creatures.combatStrength;
            const creatureTypeStrength = combatStrength.getCreature(creature.type, creature.aberrant);
            const creatureTier = combatStrength.getTier(creatureTypeStrength);
            if (creatureTier <= CombatStrengthManager_1.CombatStrength.Tier4) {
                return false;
            }
            const creatureDifficulty = combatStrength.getCreatureDifficultyAgainstHuman(creature, context.human);
            const creatureDangerLevel = combatStrength.getDangerLevel(creatureDifficulty);
            if (creatureDangerLevel === CombatStrengthManager_1.CombatDangerLevel.VeryHigh || creatureDangerLevel === CombatStrengthManager_1.CombatDangerLevel.Extreme) {
                return true;
            }
            switch (creature.type) {
                case ICreature_1.CreatureType.Shark:
                case ICreature_1.CreatureType.Zombie:
                case ICreature_1.CreatureType.Coyote:
                    return !this.hasDecentEquipment(context);
                case ICreature_1.CreatureType.Kraken:
                    return !this.hasDecentEquipment(context) ||
                        context.human.getEquippedItem(IHuman_1.EquipType.Legs)?.type === IItem_1.ItemType.BarkLeggings ||
                        context.human.getEquippedItem(IHuman_1.EquipType.Chest)?.type === IItem_1.ItemType.BarkTunic;
                default:
                    return creature.aberrant ? !this.hasDecentEquipment(context) : false;
            }
        }
        hasDecentEquipment(context) {
            const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest) ? 1 : 0;
            const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs) ? 1 : 0;
            const waist = context.human.getEquippedItem(IHuman_1.EquipType.Waist) ? 1 : 0;
            const neck = context.human.getEquippedItem(IHuman_1.EquipType.Neck) ? 1 : 0;
            const head = context.human.getEquippedItem(IHuman_1.EquipType.Head) ? 1 : 0;
            const feet = context.human.getEquippedItem(IHuman_1.EquipType.Feet) ? 1 : 0;
            const hands = context.human.getEquippedItem(IHuman_1.EquipType.Hands) ? 1 : 0;
            return (chest + legs + waist + neck + head + feet + hands) >= 4 ? true : false;
        }
    }
    exports.CreatureUtilities = CreatureUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL0NyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFhSCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVrQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7UUF1RTNDLENBQUM7UUFyRU8sNkJBQTZCLENBQUMsT0FBZ0I7WUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRS9ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQUtNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0I7WUFDN0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUU1QixNQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7WUFFakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMs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
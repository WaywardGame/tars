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
define(["require", "exports", "@wayward/game/game/entity/creature/ICreature", "@wayward/game/game/entity/IHuman", "@wayward/game/game/item/IItem", "@wayward/game/game/entity/IStats", "@wayward/game/game/entity/player/IPlayer", "@wayward/game/game/entity/CombatStrengthManager"], function (require, exports, ICreature_1, IHuman_1, IItem_1, IStats_1, IPlayer_1, CombatStrengthManager_1) {
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
                    if (creature && !creature.isTamed && creature.hitchedTo === undefined && creature.findPath(undefined, context.human.tile, creature.getMoveType(), 256, context.human) !== undefined) {
                        creatures.push(creature);
                    }
                }
            }
            return creatures;
        }
        isScaredOfCreature(human, creature) {
            const combatStrength = human.island.creatures.combatStrength;
            const creatureDifficulty = combatStrength.getCreatureDifficultyAgainstHuman(creature, human);
            const creatureDangerLevel = combatStrength.getDangerLevel(creatureDifficulty);
            if (creatureDangerLevel === CombatStrengthManager_1.CombatDangerLevel.VeryHigh || creatureDangerLevel === CombatStrengthManager_1.CombatDangerLevel.Extreme) {
                return true;
            }
            switch (creature.type) {
                case ICreature_1.CreatureType.Shark:
                case ICreature_1.CreatureType.Zombie:
                case ICreature_1.CreatureType.Coyote:
                    return !this.hasDecentEquipment(human);
                case ICreature_1.CreatureType.Kraken:
                    return !this.hasDecentEquipment(human) ||
                        human.getEquippedItem(IHuman_1.EquipType.Legs)?.type === IItem_1.ItemType.BarkLeggings ||
                        human.getEquippedItem(IHuman_1.EquipType.Chest)?.type === IItem_1.ItemType.BarkTunic;
                default:
                    return creature.aberrant ? !this.hasDecentEquipment(human) : false;
            }
        }
        hasDecentEquipment(human) {
            const chest = human.getEquippedItem(IHuman_1.EquipType.Chest) ? 1 : 0;
            const legs = human.getEquippedItem(IHuman_1.EquipType.Legs) ? 1 : 0;
            const waist = human.getEquippedItem(IHuman_1.EquipType.Waist) ? 1 : 0;
            const neck = human.getEquippedItem(IHuman_1.EquipType.Neck) ? 1 : 0;
            const head = human.getEquippedItem(IHuman_1.EquipType.Head) ? 1 : 0;
            const feet = human.getEquippedItem(IHuman_1.EquipType.Feet) ? 1 : 0;
            const hands = human.getEquippedItem(IHuman_1.EquipType.Hands) ? 1 : 0;
            return (chest + legs + waist + neck + head + feet + hands) >= 4 ? true : false;
        }
    }
    exports.CreatureUtilities = CreatureUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXR1cmVVdGlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL0NyZWF0dXJlVXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFjSCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVrQix5QkFBb0IsR0FBRyxDQUFDLENBQUM7UUF1RTNDLENBQUM7UUFyRU8sNkJBQTZCLENBQUMsT0FBZ0I7WUFDcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRS9ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckksQ0FBQztRQUtNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0I7WUFDN0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUU1QixNQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7WUFFakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN4QyxNQUFNLFFB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
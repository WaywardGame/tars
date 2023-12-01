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
import type Context from "../core/context/Context";
import Human from "@wayward/game/game/entity/Human";
export declare class CreatureUtilities {
    private readonly nearbyCreatureRadius;
    shouldRunAwayFromAllCreatures(context: Context): boolean;
    getNearbyCreatures(context: Context, radius?: number): Creature[];
    isScaredOfCreature(human: Human, creature: Creature): boolean;
    hasDecentEquipment(human: Human): boolean;
}

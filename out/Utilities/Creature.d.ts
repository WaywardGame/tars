import type Creature from "game/entity/creature/Creature";
import type Context from "../core/context/Context";
export declare class CreatureUtilities {
    private readonly nearbyCreatureRadius;
    shouldRunAwayFromAllCreatures(context: Context): boolean;
    getNearbyCreatures(context: Context): Creature[];
    isScaredOfCreature(context: Context, creature: Creature): boolean;
    private hasDecentEquipment;
}
export declare const creatureUtilities: CreatureUtilities;

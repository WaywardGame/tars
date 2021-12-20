import Creature from "game/entity/creature/Creature";
import Context from "../Context";
declare class CreatureUtilities {
    private readonly nearbyCreatureRadius;
    shouldRunAwayFromAllCreatures(context: Context): boolean;
    getNearbyCreatures(context: Context): Creature[];
    isScaredOfCreature(context: Context, creature: Creature): boolean;
    private hasDecentEquipment;
}
export declare const creatureUtilities: CreatureUtilities;
export {};

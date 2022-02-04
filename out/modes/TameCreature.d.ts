import { CreatureType } from "game/entity/creature/ICreature";
import Creature from "game/entity/creature/Creature";
import Player from "game/entity/player/Player";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
export declare class TameCreatureMode implements ITarsMode {
    private readonly creatureType;
    private finished;
    constructor(creatureType: CreatureType);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
    onCreatureTame(creature: Creature, owner: Player): void;
}

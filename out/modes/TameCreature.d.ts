import Creature from "game/entity/creature/Creature";
import { CreatureType } from "game/entity/creature/ICreature";
import Human from "game/entity/Human";
import type Context from "../core/context/Context";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
export declare class TameCreatureMode implements ITarsMode {
    private readonly creatureType;
    private finished;
    constructor(creatureType: CreatureType);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
    onCreatureTame(creature: Creature, owner: Human): void;
}

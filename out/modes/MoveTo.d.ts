import type { NPCType } from "game/entity/npc/INPCs";
import type { DoodadType } from "game/doodad/IDoodad";
import type { IslandId } from "game/island/IIsland";
import type { TerrainType } from "game/tile/ITerrain";
import type { ITarsMode } from "../core/mode/IMode";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { CreatureType } from "game/entity/creature/ICreature";
export declare enum MoveToType {
    Island = 0,
    Terrain = 1,
    Doodad = 2,
    Creature = 3,
    Player = 4,
    Base = 5,
    NPC = 6
}
interface IMoveTo {
    type: MoveToType;
}
export interface IMoveToIsland extends IMoveTo {
    type: MoveToType.Island;
    islandId: IslandId;
}
export interface IMoveToTerrain extends IMoveTo {
    type: MoveToType.Terrain;
    terrainType: TerrainType;
}
export interface IMoveToDoodad extends IMoveTo {
    type: MoveToType.Doodad;
    doodadType: DoodadType;
}
export interface IMoveToPlayer extends IMoveTo {
    type: MoveToType.Player;
    playerIdentifier: string;
}
export interface IMoveToNPC extends IMoveTo {
    type: MoveToType.NPC;
    npcType: NPCType;
}
export interface IMoveToCreature extends IMoveTo {
    type: MoveToType.Creature;
    creatureType: CreatureType;
}
export interface IMoveToBase extends IMoveTo {
    type: MoveToType.Base;
}
export declare type MoveTo = IMoveToIsland | IMoveToTerrain | IMoveToDoodad | IMoveToPlayer | IMoveToCreature | IMoveToNPC | IMoveToBase;
export declare class MoveToMode implements ITarsMode {
    private readonly target;
    private finished;
    constructor(target: MoveTo);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}
export {};

import type { NPCType } from "game/entity/npc/INPCs";
import type { DoodadType } from "game/doodad/IDoodad";
import type { IslandId } from "game/island/IIsland";
import type { TerrainType } from "game/tile/ITerrain";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
export declare enum MoveToType {
    Island = 0,
    Terrain = 1,
    Doodad = 2,
    Player = 3,
    Base = 4,
    NPC = 5
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
export interface IMoveToBase extends IMoveTo {
    type: MoveToType.Base;
}
export declare type MoveTo = IMoveToIsland | IMoveToTerrain | IMoveToDoodad | IMoveToPlayer | IMoveToNPC | IMoveToBase;
export declare class MoveToMode implements ITarsMode {
    private readonly target;
    private finished;
    constructor(target: MoveTo);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}
export {};

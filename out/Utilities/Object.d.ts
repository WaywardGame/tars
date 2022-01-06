import type Doodad from "game/doodad/Doodad";
import type Corpse from "game/entity/creature/corpse/Corpse";
import type Creature from "game/entity/creature/Creature";
import type { IVector3 } from "utilities/math/IVector";
import type NPC from "game/entity/npc/NPC";
import type Item from "game/item/Item";
import type Context from "../core/context/Context";
export declare enum FindObjectType {
    Creature = 0,
    Doodad = 1,
    Corpse = 2,
    Item = 3,
    NPC = 4
}
export declare class ObjectUtilities {
    private readonly cachedSorts;
    private readonly cachedObjects;
    clearCache(): void;
    getSortedObjects<T>(context: Context, type: FindObjectType, allObjects: SaferArray<T>, getPoint?: (object: T) => IVector3): T[];
    findObjects<T>(context: Context, type: FindObjectType, id: string, allObjects: SaferArray<T>, isTarget: (object: T) => boolean, top?: number, getPoint?: (object: T) => IVector3): T[];
    findObject<T extends IVector3>(context: Context, type: FindObjectType, id: string, object: T[], isTarget: (object: T) => boolean): T | undefined;
    findDoodad(context: Context, id: string, isTarget: (doodad: Doodad) => boolean): Doodad | undefined;
    findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[];
    findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[];
    findNPCS(context: Context, id: string, isTarget: (npc: NPC) => boolean, top?: number): NPC[];
    findItem(context: Context, id: string, isTarget: (item: Item) => boolean, top?: number): Item[];
    findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[];
    findHuntableCreatures(context: Context, id: string, onlyHostile?: boolean, top?: number): Creature[];
    findTamableCreatures(context: Context, id: string, onlyHostile: boolean, top?: number): Creature[];
}

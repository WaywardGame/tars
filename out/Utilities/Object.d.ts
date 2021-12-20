import Doodad from "game/doodad/Doodad";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import { IVector3 } from "utilities/math/IVector";
import NPC from "game/entity/npc/NPC";
import Item from "game/item/Item";
import Context from "../Context";
export declare enum FindObjectType {
    Creature = 0,
    Doodad = 1,
    Corpse = 2,
    Item = 3,
    NPC = 4
}
declare class ObjectUtilities {
    private cachedSorts;
    private cachedObjects;
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
}
export declare const objectUtilities: ObjectUtilities;
export {};

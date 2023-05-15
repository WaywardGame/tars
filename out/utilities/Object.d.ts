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
import type Doodad from "game/doodad/Doodad";
import type Corpse from "game/entity/creature/corpse/Corpse";
import type Creature from "game/entity/creature/Creature";
import type { IVector3 } from "utilities/math/IVector";
import type NPC from "game/entity/npc/NPC";
import type Context from "../core/context/Context";
import { CreatureType } from "game/entity/creature/ICreature";
export declare enum FindObjectType {
    Creature = 0,
    Doodad = 1,
    Corpse = 2,
    NPC = 3
}
export declare class ObjectUtilities {
    private readonly cachedSorts;
    private readonly cachedObjects;
    clearCache(): void;
    getSortedObjects<T>(context: Context, type: FindObjectType, allObjects: SaferArray<T>, getPoint?: (object: T) => IVector3): T[];
    private findObjects;
    findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[];
    findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[];
    findNPCS(context: Context, id: string, isTarget: (npc: NPC) => boolean, top?: number): NPC[];
    findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[];
    findHuntableCreatures(context: Context, id: string, options?: Partial<{
        type: CreatureType;
        onlyHostile: boolean;
        top: number;
        skipWaterCreatures: boolean;
    }>): Creature[];
    findTamableCreatures(context: Context, id: string, options?: Partial<{
        type: CreatureType;
        hostile: boolean;
        top: number;
    }>): Creature[];
}

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
import type Doodad from "@wayward/game/game/doodad/Doodad";
import type Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import type Creature from "@wayward/game/game/entity/creature/Creature";
import type NPC from "@wayward/game/game/entity/npc/NPC";
import type Context from "../core/context/Context";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import Entity from "@wayward/types/definitions/game/game/entity/Entity";
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
    getSortedObjects<T extends Entity>(context: Context, type: FindObjectType, allObjects: SaferArray<T>): T[];
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

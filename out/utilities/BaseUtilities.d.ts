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
import type Creature from "@wayward/game/game/entity/creature/Creature";
import type Item from "@wayward/game/game/item/Item";
import type Context from "../core/context/Context";
import type { IBaseInfo } from "../core/ITars";
import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import Tile from "@wayward/game/game/tile/Tile";
export interface IBuildTileOptions {
    openAreaRadius: number;
    allowWater: boolean;
    requireShallowWater: boolean;
    nearBaseDistanceSq: number;
}
export declare class BaseUtilities {
    private tilesNearBaseCache;
    clearCache(): void;
    canBuildWaterDesalinators(context: Context): boolean;
    isGoodBuildTile(context: Context, tile: Tile, options?: Partial<IBuildTileOptions>): boolean;
    isGoodWellBuildTile(context: Context, tile: Tile, onlyUnlimited: boolean): boolean;
    isOpenArea(context: Context, tile: Tile, radius?: number, allowWater?: boolean, requireShallowWater?: boolean): boolean;
    getBaseTiles(context: Context): Set<Tile>;
    isBaseDoodad(context: Context, doodad: Doodad): boolean;
    getBaseTile(context: Context): Tile;
    hasBase(context: Context): boolean;
    isNearBase(context: Context, tile?: Tile, distanceSq?: number): boolean;
    getTilesNearBase(context: Context): Tile[];
    getTilesWithItemsNearBase(context: Context): {
        tiles: Tile[];
        totalCount: number;
    };
    getTileItemsNearBase(context: Context): Item[];
    getSwampTilesNearBase(context: Context): Tile[];
    getNonTamedCreaturesNearBase(context: Context): Creature[];
    getWaterSourceDoodads(context: Context): Doodad[];
    isTreasureChestLocation(context: Context, tile: Tile): boolean;
    matchesBaseInfo(context: Context, info: IBaseInfo, doodadType: DoodadType, tile?: Tile): boolean;
    findInitialBuildTile(context: Context): Promise<Tile | undefined>;
    private isGoodTargetOrigin;
}

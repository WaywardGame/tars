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
import { TerrainType } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
import Item from "game/item/Item";
import Tile from "game/tile/Tile";
import type { ITileLocation } from "../core/ITars";
import Context from "../core/context/Context";
import { ExtendedTerrainType } from "../core/navigation/INavigation";
export interface IOpenTileOptions {
    requireNoItemsOnTile: boolean;
    disallowWater: boolean;
    requireInfiniteShallowWater: boolean;
}
export declare class TileUtilities {
    private readonly tileLocationCache;
    private readonly canUseArgsCache;
    clearCache(): void;
    getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, positionOverride?: IVector3): ITileLocation[];
    private _getNearestTileLocation;
    isSwimmingOrOverWater(context: Context): boolean;
    isOverDeepSeaWater(context: Context): boolean;
    isOpenTile(context: Context, tile: Tile, options?: Partial<IOpenTileOptions>): boolean;
    isFreeOfOtherPlayers(context: Context, tile: Tile): boolean;
    canGather(context: Context, tile: Tile, skipDoodadCheck?: boolean): boolean;
    canDig(context: Context, tile: Tile): boolean;
    canTill(context: Context, tile: Tile, tool: Item | undefined, allowedTilesSet: Set<TerrainType>): boolean;
    canButcherCorpse(context: Context, tile: Tile, tool: Item | undefined): boolean;
    hasCorpses(tile: Tile): boolean;
    hasItems(tile: Tile): boolean;
    private getCanUseArgs;
}

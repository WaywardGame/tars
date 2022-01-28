import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";
export declare class TileUtilities {
    private readonly cache;
    clearCache(): void;
    getNearestTileLocation(context: Context, tileType: TerrainType, positionOverride?: IVector3): Promise<ITileLocation[]>;
    isSwimmingOrOverWater(context: Context): boolean;
    isOverDeepSeaWater(context: Context): boolean;
    isOpenTile(context: Context, point: IVector3, tile: ITile, allowWater?: boolean, requireShallowWater?: boolean): boolean;
    isFreeOfOtherPlayers(context: Context, point: IVector3): boolean;
    canGather(context: Context, tile: ITile, skipDoodadCheck?: boolean): boolean;
    canDig(context: Context, tile: ITile): boolean;
    canButcherCorpse(context: Context, tile: ITile, skipCorpseCheck?: boolean): boolean;
    hasCorpses(tile: ITile): boolean;
    hasItems(tile: ITile): boolean;
}

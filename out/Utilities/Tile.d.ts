import { ITile, TerrainType } from "game/tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Context from "../Context";
import { ITileLocation } from "../ITars";
declare class TileUtilities {
    private cache;
    clearCache(): void;
    getNearestTileLocation(contextOrPosition: Context | IVector3, tileType: TerrainType): Promise<ITileLocation[]>;
    isSwimmingOrOverWater(context: Context): boolean;
    isOverDeepSeaWater(context: Context): boolean;
    isOpenTile(context: Context, point: IVector3, tile: ITile, allowWater?: boolean): boolean;
    isFreeOfOtherPlayers(context: Context, point: IVector3): boolean;
    canGather(context: Context, tile: ITile, skipDoodadCheck?: boolean): boolean;
    canDig(context: Context, tile: ITile): boolean;
    canButcherCorpse(context: Context, tile: ITile, skipCorpseCheck?: boolean): boolean;
    hasCorpses(tile: ITile): boolean;
    hasItems(tile: ITile): boolean;
}
export declare const tileUtilities: TileUtilities;
export {};

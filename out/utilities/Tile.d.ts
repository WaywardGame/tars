import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";
import Item from "game/item/Item";
export interface IOpenTileOptions {
    requireNoItemsOnTile: boolean;
    disallowWater: boolean;
    requireInfiniteShallowWater: boolean;
}
export declare class TileUtilities {
    private readonly tileLocationCache;
    private readonly canUseArgsCache;
    clearCache(): void;
    getNearestTileLocation(context: Context, tileType: TerrainType, positionOverride?: IVector3): ITileLocation[];
    private _getNearestTileLocation;
    isSwimmingOrOverWater(context: Context): boolean;
    isOverDeepSeaWater(context: Context): boolean;
    isOpenTile(context: Context, point: IVector3, tile: ITile, options?: Partial<IOpenTileOptions>): boolean;
    isFreeOfOtherPlayers(context: Context, point: IVector3): boolean;
    canGather(context: Context, tile: ITile, skipDoodadCheck?: boolean): boolean;
    canDig(context: Context, tilePosition: IVector3): boolean;
    canTill(context: Context, tilePosition: IVector3, tile: ITile, tool: Item | undefined, allowedTilesSet: Set<TerrainType>): boolean;
    canButcherCorpse(context: Context, tilePosition: IVector3, tool: Item | undefined): boolean;
    hasCorpses(tile: ITile): boolean;
    hasItems(tile: ITile): boolean;
    private getCanUseArgs;
}

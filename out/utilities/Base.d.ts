import type Doodad from "game/doodad/Doodad";
import type { ITile } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
import type Creature from "game/entity/creature/Creature";
import type Item from "game/item/Item";
import type Context from "../core/context/Context";
import type { IBaseInfo } from "../core/ITars";
import { DoodadType } from "game/doodad/IDoodad";
export interface IBuildTileOptions {
    openAreaRadius: number;
    allowWater: boolean;
    requireShallowWater: boolean;
    nearBaseDistanceSq: number;
}
export declare class BaseUtilities {
    private tilesNearBaseCache;
    clearCache(): void;
    shouldBuildWaterStills(context: Context): boolean;
    isGoodBuildTile(context: Context, point: IVector3, tile: ITile, options?: Partial<IBuildTileOptions>): boolean;
    isGoodWellBuildTile(context: Context, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean;
    isOpenArea(context: Context, point: IVector3, tile: ITile, radius?: number, allowWater?: boolean, requireShallowWater?: boolean): boolean;
    getBaseDoodads(context: Context): Doodad[];
    isBaseTile(context: Context, tile: ITile): boolean;
    isBaseDoodad(context: Context, doodad: Doodad): boolean;
    getBasePosition(context: Context): IVector3;
    hasBase(context: Context): boolean;
    isNearBase(context: Context, point?: IVector3, distanceSq?: number): boolean;
    getTilesNearBase(context: Context): {
        point: IVector3;
        tile: ITile;
    }[];
    getTilesWithItemsNearBase(context: Context): {
        tiles: IVector3[];
        totalCount: number;
    };
    getTileItemsNearBase(context: Context): Item[];
    getSwampTilesNearBase(context: Context): IVector3[];
    getNonTamedCreaturesNearBase(context: Context): Creature[];
    matchesBaseInfo(context: Context, info: IBaseInfo, doodadType: DoodadType, point?: IVector3): boolean;
    findInitialBuildTile(context: Context): Promise<IVector3 | undefined>;
    private isGoodTargetOrigin;
}

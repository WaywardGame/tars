import Doodad from "game/doodad/Doodad";
import { ITile } from "game/tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Creature from "game/entity/creature/Creature";
import Item from "game/item/Item";
import Context from "../core/context/Context";
declare class BaseUtilities {
    private tilesNearBaseCache;
    clearCache(): void;
    shouldBuildWaterStills(context: Context): boolean;
    isGoodBuildTile(context: Context, point: IVector3, tile: ITile, openAreaRadius?: number): boolean;
    isGoodWellBuildTile(context: Context, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean;
    isOpenArea(context: Context, point: IVector3, tile: ITile, radius?: number): boolean;
    getBaseDoodads(context: Context): Doodad[];
    isBaseDoodad(context: Context, doodad: Doodad): boolean;
    getBasePosition(context: Context): IVector3;
    hasBase(context: Context): boolean;
    isNearBase(context: Context, point?: IVector3): boolean;
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
}
export declare const baseUtilities: BaseUtilities;
export {};

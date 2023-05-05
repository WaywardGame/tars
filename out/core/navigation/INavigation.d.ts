import { TerrainType } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
export interface NavigationPath {
    path: IVector3[];
    score: number;
}
export declare const freshWaterTileLocation = -1;
export declare const anyWaterTileLocation = -2;
export declare const gatherableTileLocation = -3;
export type ExtendedTerrainType = TerrainType | -1 | -2 | -3;

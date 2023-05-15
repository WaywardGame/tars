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
export interface NavigationPath {
    path: IVector3[];
    score: number;
}
export declare const freshWaterTileLocation = -1;
export declare const anyWaterTileLocation = -2;
export declare const gatherableTileLocation = -3;
export type ExtendedTerrainType = TerrainType | -1 | -2 | -3;

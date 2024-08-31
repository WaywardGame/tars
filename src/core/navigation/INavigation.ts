import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";

export interface NavigationPath { path: IVector3[]; score: number }

export const freshWaterTileLocation = -1;
export const anyWaterTileLocation = -2;
export const gatherableTileLocation = -3;

export type ExtendedTerrainType = TerrainType | -1 | -2 | -3;

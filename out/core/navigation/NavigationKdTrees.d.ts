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
import { TileUpdateType } from "@wayward/game/game/IGame";
import Island from "@wayward/game/game/island/Island";
import Tile from "@wayward/game/game/tile/Tile";
import { KdTree } from "@wayward/game/utilities/collection/kdtree/KdTree";
import { ExtendedTerrainType } from "./INavigation";
interface INavigationMapData {
    kdTreeTileTypes: Uint8Array;
    kdTrees: Map<ExtendedTerrainType, KdTree>;
}
export declare class NavigationKdTrees {
    private maps;
    private readonly freshWaterTypes;
    private readonly seaWaterTypes;
    private readonly gatherableTypes;
    load(): void;
    unload(): void;
    initializeIsland(island: Island): void;
    getKdTree(island: Island, z: number, tileType: ExtendedTerrainType): KdTree | undefined;
    onTileUpdate(island: Island, tile: Tile, tileUpdateType: TileUpdateType): void;
    updateKdTree(island: Island, x: number, y: number, z: number, tileType: number, navigationMapData?: INavigationMapData | undefined): void;
    private updateKdTreeSpecialTileTypes;
}
export {};

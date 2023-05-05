import { TileUpdateType } from "game/IGame";
import Island from "game/island/Island";
import Tile from "game/tile/Tile";
import { KdTree } from "utilities/collection/tree/KdTree";
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

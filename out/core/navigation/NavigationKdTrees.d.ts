import { TileUpdateType } from "game/IGame";
import Island from "game/island/Island";
import { ITile, TerrainType } from "game/tile/ITerrain";
import { KdTree } from "utilities/collection/tree/KdTree";
interface INavigationMapData {
    kdTreeTileTypes: Uint8Array;
    kdTrees: Map<TerrainType, KdTree>;
}
export declare class NavigationKdTrees {
    private maps;
    private readonly freshWaterTypes;
    private readonly seaWaterTypes;
    private readonly gatherableTypes;
    load(): void;
    unload(): void;
    initializeIsland(island: Island): void;
    getKdTree(island: Island, z: number, tileType: TerrainType): KdTree | undefined;
    onTileUpdate(island: Island, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void;
    updateKdTree(island: Island, x: number, y: number, z: number, tileType: number, navigationMapData?: INavigationMapData | undefined): void;
    private updateKdTreeSpecialTileTypes;
}
export {};

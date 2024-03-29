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

import { EventBus } from "event/EventBuses";
import EventManager, { EventHandler } from "event/EventManager";
import { TileUpdateType } from "game/IGame";
import Island from "game/island/Island";
import { TerrainType } from "game/tile/ITerrain";
import { terrainDescriptions } from "game/tile/Terrains";
import Tile from "game/tile/Tile";
import { WorldZ } from "game/WorldZ";
import { KdTree } from "utilities/collection/tree/KdTree";
import Enums from "utilities/enum/Enums";
import { IVector2 } from "utilities/math/IVector";

import { freshWaterTileLocation, anyWaterTileLocation, gatherableTileLocation, ExtendedTerrainType } from "./INavigation";

interface INavigationMapData {
    kdTreeTileTypes: Uint8Array;
    kdTrees: Map<ExtendedTerrainType, KdTree>;
}

/**
 * Shared KdTrees across multiple TARS instances
 */
export class NavigationKdTrees {

    private maps: WeakMap<Island, Map<number, INavigationMapData>> = new Map();

    private readonly freshWaterTypes: Set<TerrainType> = new Set();
    private readonly seaWaterTypes: Set<TerrainType> = new Set();
    private readonly gatherableTypes: Set<TerrainType> = new Set();

    public load() {
        this.unload();

        for (const tileType of Enums.values(TerrainType)) {
            const tileTypeName = TerrainType[tileType];

            const terrainDescription = terrainDescriptions[tileType];
            if (!terrainDescription || terrainDescription.ice) {
                continue;
            }

            if (tileTypeName.includes("FreshWater")) {
                this.freshWaterTypes.add(tileType);

            } else if (tileTypeName.includes("Seawater")) {
                this.seaWaterTypes.add(tileType);
            }

            if (terrainDescription.gather) {
                this.gatherableTypes.add(tileType);
            }
        }

        EventManager.registerEventBusSubscriber(this);
    }

    public unload() {
        EventManager.deregisterEventBusSubscriber(this);

        this.maps = new WeakMap();

        this.freshWaterTypes.clear();
        this.seaWaterTypes.clear();
        this.gatherableTypes.clear();
    }

    /**
     * Initializes kdtrees for the provided island.
     * No-ops if the island was already initialized
     */
    public initializeIsland(island: Island) {
        let islandMaps = this.maps.get(island);
        if (islandMaps) {
            return;
        }

        islandMaps = new Map();

        for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
            const data: INavigationMapData = {
                kdTrees: new Map(),
                kdTreeTileTypes: new Uint8Array(island.mapSizeSq),
            };

            data.kdTrees.set(freshWaterTileLocation, new KdTree());
            data.kdTrees.set(anyWaterTileLocation, new KdTree());
            data.kdTrees.set(gatherableTileLocation, new KdTree());

            // attempt to make a somewhat balanced kdtree by starting at the midpoint
            const halfMapSize = Math.floor(island.mapSize / 2);

            for (let offsetX = 0; offsetX < halfMapSize; offsetX++) {
                for (let offsetY = 0; offsetY < halfMapSize; offsetY++) {
                    const x1 = halfMapSize + offsetX;
                    const y1 = halfMapSize + offsetY;
                    this.updateKdTree(island, x1, y1, z, island.getTile(x1, y1, z).type, data);

                    if (offsetX !== 0 || offsetY !== 0) {
                        const x2 = halfMapSize - offsetX;
                        const y2 = halfMapSize - offsetY;
                        this.updateKdTree(island, x2, y2, z, island.getTile(x2, y2, z).type, data);
                    }
                }
            }

            islandMaps.set(z, data);
        }

        this.maps.set(island, islandMaps);
    }

    public getKdTree(island: Island, z: number, tileType: ExtendedTerrainType): KdTree | undefined {
        return this.maps.get(island)?.get(z)?.kdTrees.get(tileType);
    }

    @EventHandler(EventBus.Island, "tileUpdate")
    public onTileUpdate(island: Island, tile: Tile, tileUpdateType: TileUpdateType): void {
        const maps = this.maps.get(island);
        if (!maps) {
            return;
        }

        this.updateKdTree(island, tile.x, tile.y, tile.z, tile.type, maps.get(tile.z));
    }

    public updateKdTree(island: Island, x: number, y: number, z: number, tileType: number, navigationMapData: INavigationMapData | undefined = this.maps.get(island)?.get(z)) {
        if (!navigationMapData) {
            throw new Error(`Invalid navigation info for ${island}, ${z}`);
        }

        const point: IVector2 = { x, y };

        const kdTreeIndex = (y * island.mapSize) + x;
        let kdTreeTileType = navigationMapData.kdTreeTileTypes[kdTreeIndex];
        if (kdTreeTileType !== 0) {
            kdTreeTileType--;

            if (kdTreeTileType === tileType) {
                return;
            }

            // tile type changed

            navigationMapData.kdTrees.get(kdTreeTileType)!.remove(point);

            this.updateKdTreeSpecialTileTypes(navigationMapData, kdTreeTileType, point, false);
        }

        navigationMapData.kdTreeTileTypes[kdTreeIndex] = tileType + 1;

        let kdTree = navigationMapData.kdTrees.get(tileType);
        if (!kdTree) {
            kdTree = new KdTree();
            navigationMapData.kdTrees.set(tileType, kdTree);
        }

        kdTree.add(point);

        this.updateKdTreeSpecialTileTypes(navigationMapData, tileType, point, true);
    }

    private updateKdTreeSpecialTileTypes(navigationMapData: INavigationMapData, tileType: TerrainType, point: IVector2, insert: boolean) {
        const isFreshWater = this.freshWaterTypes.has(tileType);
        const isSeawater = this.seaWaterTypes.has(tileType);

        if (isFreshWater || isSeawater) {
            if (insert) {
                navigationMapData.kdTrees.get(anyWaterTileLocation)!.add(point);

            } else {
                navigationMapData.kdTrees.get(anyWaterTileLocation)!.remove(point);
            }

            if (isFreshWater) {
                if (insert) {
                    navigationMapData.kdTrees.get(freshWaterTileLocation)!.add(point);

                } else {
                    navigationMapData.kdTrees.get(freshWaterTileLocation)!.remove(point);
                }
            }
        }

        if (this.gatherableTypes.has(tileType)) {
            if (insert) {
                navigationMapData.kdTrees.get(gatherableTileLocation)!.add(point);

            } else {
                navigationMapData.kdTrees.get(gatherableTileLocation)!.remove(point);
            }
        }
    }
}

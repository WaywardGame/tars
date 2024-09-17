import { EventBus } from "@wayward/game/event/EventBuses";
import { EventHandler, eventManager } from "@wayward/game/event/EventManager";
import { TileUpdateType } from "@wayward/game/game/IGame";
import Island from "@wayward/game/game/island/Island";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import { terrainDescriptions } from "@wayward/game/game/tile/Terrains";
import Tile from "@wayward/game/game/tile/Tile";
import WorldZ from "@wayward/utilities/game/WorldZ";
import { KdTree } from "@wayward/game/utilities/collection/kdtree/KdTree";
import Enums from "@wayward/game/utilities/enum/Enums";
import { IVector2 } from "@wayward/game/utilities/math/IVector";
import { yieldTask } from "@wayward/utilities/promise/Async";

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

	public load(): void {
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

		eventManager.registerEventBusSubscriber(this);
	}

	public unload(): void {
		eventManager.deregisterEventBusSubscriber(this);

		this.maps = new WeakMap();

		this.freshWaterTypes.clear();
		this.seaWaterTypes.clear();
		this.gatherableTypes.clear();
	}

	/**
	 * Initializes kdtrees for the provided island.
	 * No-ops if the island was already initialized
	 */
	public async initializeIsland(island: Island): Promise<void> {
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

				// prevent freezing while this is being initialized
				if (offsetX % 10 === 0) {
					await yieldTask();
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

	public updateKdTree(island: Island, x: number, y: number, z: number, tileType: number, navigationMapData: INavigationMapData | undefined = this.maps.get(island)?.get(z)): void {
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

	private updateKdTreeSpecialTileTypes(navigationMapData: INavigationMapData, tileType: TerrainType, point: IVector2, insert: boolean): void {
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

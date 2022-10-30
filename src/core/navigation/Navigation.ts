import type { IDijkstraMap, IDijkstraMapFindPathResult } from "@cplusplus/index";
import type { ITerrainDescription, ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import { TileEventType } from "game/tile/ITileEvent";
import terrainDescriptions from "game/tile/Terrains";
import { WorldZ } from "game/WorldZ";
import Enums from "utilities/enum/Enums";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector2, IVector3 } from "utilities/math/IVector";
import { KdTree } from "utilities/collection/tree/KdTree";
import { TileUpdateType } from "game/IGame";
import Human from "game/entity/Human";
import Log from "utilities/Log";

import type { ITileLocation } from "../ITars";
import { anyWaterTileLocation, freshWaterTileLocation, gatherableTileLocation, NavigationPath } from "./INavigation";
import { TarsOverlay } from "../../ui/TarsOverlay";
import Island from "game/island/Island";

interface INavigationMapData {
	dijkstraMap: IDijkstraMap;
	dirtyDijkstra: boolean;
	kdTreeTileTypes: Uint8Array;
	kdTrees: Map<TerrainType, KdTree>;
	tileTypeCache: Map<TerrainType, Map<ITile, IVector2>>;
}

export const tileUpdateRadius = 2;

export const creaturePenaltyRadius = 2;

export default class Navigation {

	private readonly maps: Map<number, INavigationMapData> = new Map();

	private readonly nodePenaltyCache: Map<string, number> = new Map();
	private readonly nodeDisableCache: Map<string, boolean> = new Map();

	private origin: IVector3 | undefined;
	private originUpdateTimeout: number | undefined;

	private oppositeOrigin: IVector3 | undefined;

	private sailingMode: boolean;

	private readonly freshWaterTypes: Set<TerrainType> = new Set();
	private readonly seaWaterTypes: Set<TerrainType> = new Set();
	private readonly gatherableTypes: Set<TerrainType> = new Set();

	constructor(private readonly log: Log, private readonly human: Human, private readonly overlay: TarsOverlay) {
	}

	public load() {
		this.unload();

		this.origin = undefined;

		this.sailingMode = false;

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			try {
				const data: INavigationMapData = {
					dijkstraMap: new Module.DijkstraMap(),
					dirtyDijkstra: true,
					kdTrees: new Map(),
					kdTreeTileTypes: new Uint8Array(game.mapSizeSq),
					tileTypeCache: new Map(),
				};

				data.kdTrees.set(freshWaterTileLocation, new KdTree());
				data.kdTrees.set(anyWaterTileLocation, new KdTree());
				data.kdTrees.set(gatherableTileLocation, new KdTree());

				this.maps.set(z, data);

			} catch (ex) {
				this.log.error("Failed to create dijkstraMap", ex);
				this.maps.delete(z);
			}
		}

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
	}

	public unload() {
		for (const mapInfo of this.maps.values()) {
			try {
				mapInfo.dijkstraMap.delete();

			} catch (ex) {
				this.log.error(`Failed to delete dijkstra map: ${ex}`);
			}
		}

		this.maps.clear();

		this.overlay.clear();
		this.nodePenaltyCache.clear();
		this.nodeDisableCache.clear();

		this.freshWaterTypes.clear();
		this.seaWaterTypes.clear();
		this.gatherableTypes.clear();

		if (this.originUpdateTimeout !== undefined) {
			window.clearTimeout(this.originUpdateTimeout);
			this.originUpdateTimeout = undefined;
		}
	}

	public shouldUpdateSailingMode(sailingMode: boolean) {
		return this.sailingMode !== sailingMode;
	}

	public updateAll(sailingMode: boolean): void {
		this.log.info("Updating navigation. Please wait...");

		this.sailingMode = sailingMode;

		const island = this.human.island;

		const start = performance.now();

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			const mapData = this.maps.get(z);

			for (let x = 0; x < game.mapSize; x++) {
				for (let y = 0; y < game.mapSize; y++) {
					const tile = island.getTile(x, y, z);
					this.onTileUpdate(island, tile, TileHelpers.getType(tile), x, y, z, false, undefined, mapData);
				}
			}
		}

		const time = performance.now() - start;

		this.log.info(`Updated navigation in ${time}ms`);
	}

	public getOrigin() {
		return this.origin;
	}

	public queueUpdateOrigin(origin?: IVector3) {
		if (origin) {
			this.origin = { x: origin.x, y: origin.y, z: origin.z };
		}

		if (this.originUpdateTimeout === undefined) {
			this.originUpdateTimeout = window.setTimeout(() => {
				this.originUpdateTimeout = undefined;
				this.updateOrigin();
			}, 10);
		}
	}

	public updateOrigin(origin?: IVector3) {
		if (origin) {
			this.origin = { x: origin.x, y: origin.y, z: origin.z };
		}

		if (!this.origin) {
			throw new Error("Invalid origin");
		}

		this._updateOrigin(this.origin.x, this.origin.y, this.origin.z);

		const oppositeZ = this.oppositeZ;
		if (oppositeZ === undefined) {
			return;
		}

		// update the origin in the opposite z to be the location of the closest point of access (cave entrance)

		const nearestCaveEntrances = this.getNearestTileLocation(TerrainType.CaveEntrance, this.origin);
		const nearestCaveEntrance = nearestCaveEntrances[0];
		if (nearestCaveEntrance) {
			const { x, y } = nearestCaveEntrance.point;

			if (this.oppositeOrigin && this.oppositeOrigin.x === x && this.oppositeOrigin.y === y && this.oppositeOrigin.z === oppositeZ) {
				// cave entrance is the same location as last time
				return;
			}

			this.oppositeOrigin = { x, y, z: oppositeZ };

			this._updateOrigin(x, y, oppositeZ);

		} else {
			this.oppositeOrigin = undefined;
		}
	}

	public get oppositeZ(): number | undefined {
		if (!this.origin) {
			throw new Error("Invalid origin");
		}

		return this.calculateOppositeZ(this.origin.z);
	}

	public getOppositeOrigin(): IVector3 | undefined {
		return this.oppositeOrigin;
	}

	/**
	 * Returns the origin for the opposite the provided z
	 */
	public calculateOppositeOrigin(z: WorldZ): IVector3 | undefined {
		const oppositeZ = this.calculateOppositeZ(z);

		if (oppositeZ !== undefined) {
			if (this.origin?.z === oppositeZ) {
				return this.origin;
			}

			if (this.oppositeOrigin?.z === oppositeZ) {
				return this.oppositeOrigin;
			}
		}

		return undefined;
	}

	public calculateOppositeZ(z: WorldZ): WorldZ | undefined {
		switch (z) {
			case WorldZ.Overworld:
				return WorldZ.Cave;

			case WorldZ.Cave:
				return WorldZ.Overworld;
		}

		return undefined;
	}

	public refreshOverlay(island: Island, tile: ITile, x: number, y: number, z: number, isBaseTile: boolean, isDisabled?: boolean, penalty?: number, tileType?: number, terrainDescription?: ITerrainDescription, tileUpdateType?: TileUpdateType) {
		tileType ??= TileHelpers.getType(tile);
		terrainDescription ??= terrainDescriptions[tileType];

		if (!terrainDescription) {
			return;
		}

		this.overlay.addOrUpdate(
			tile,
			x,
			y,
			z,
			isBaseTile,
			isDisabled ?? this.isDisabled(island, tile, x, y, z, tileType),
			penalty ?? this.getPenalty(island, tile, x, y, z, tileType, terrainDescription, tileUpdateType));
	}

	public onTileUpdate(
		island: Island,
		tile: ITile,
		tileType: TerrainType,
		x: number,
		y: number,
		z: number,
		isBaseTile: boolean,
		tileUpdateType?: TileUpdateType,
		mapData?: INavigationMapData): void {
		const mapInfo = this.maps.get(z);
		if (!mapInfo) {
			return;
		}

		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return;
		}

		const cacheId = `${x},${y},${z}`;

		const isDisabled = this.isDisabled(island, tile, x, y, z, tileType, true);
		const penalty = this.getPenalty(island, tile, x, y, z, tileType, terrainDescription, tileUpdateType, true);

		this.nodeDisableCache.set(cacheId, isDisabled);
		this.nodePenaltyCache.set(cacheId, penalty);

		this.refreshOverlay(island, tile, x, y, z, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);

		try {
			mapInfo.dirtyDijkstra = true;
			mapInfo.dijkstraMap.updateNode(x, y, penalty, isDisabled);
		} catch (ex) {
			this.log.trace("invalid node", x, y, penalty, isDisabled);
		}

		this.updateKdTree(x, y, z, tileType, mapData);

		if (!mapData) {
			this.queueUpdateOrigin();
		}
	}

	public getNearestTileLocation(tileType: TerrainType, point: IVector3): ITileLocation[] {
		// const start = performance.now();
		const kdTrees = this.maps.get(point.z)?.kdTrees;
		if (!kdTrees) {
			return [];
		}

		const nearestPoints = kdTrees.get(tileType)?.nearestPoints(point, 5) ?? [];

		return nearestPoints.map(np => {
			const nearestPoint = {
				...np.point,
				z: point.z,
			};

			const tile = this.human.island.getTileFromPoint(nearestPoint);
			if (!tile) {
				throw new Error(`Invalid point ${nearestPoint.x},${nearestPoint.y}`);
			}

			return {
				type: tileType,
				point: nearestPoint,
				tile,
			} as ITileLocation;
		});
	}

	public isDisabledFromPoint(island: Island, point: IVector3): boolean {
		if (!this.human.island.ensureValidPoint(point)) {
			return true;
		}

		const tile = this.human.island.getTileFromPoint(point);
		const tileType = TileHelpers.getType(tile);

		return this.isDisabled(island, tile, point.x, point.y, point.z, tileType);
	}

	public getPenaltyFromPoint(island: Island, point: IVector3, tile: ITile = island.getTileFromPoint(point)): number {
		const tileType = TileHelpers.getType(tile);
		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return 0;
		}

		return this.getPenalty(island, tile, point.x, point.y, point.z, tileType, terrainDescription);
	}

	public getValidPoints(island: Island, point: IVector3, moveAdjacentToTarget: boolean): IVector3[] {
		if (!moveAdjacentToTarget) {
			return !this.isDisabledFromPoint(island, point) ? [point] : [];
		}

		// "point" is disabled. we should nav to a neighbor tile instead
		const points: IVector3[] = [];

		let neighbor = { x: point.x + 1, y: point.y, z: point.z };
		if (!this.isDisabledFromPoint(island, neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x - 1, y: point.y, z: point.z };
		if (!this.isDisabledFromPoint(island, neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x, y: point.y + 1, z: point.z };
		if (!this.isDisabledFromPoint(island, neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x, y: point.y - 1, z: point.z };
		if (!this.isDisabledFromPoint(island, neighbor)) {
			points.push(neighbor);
		}

		return points.sort((a, b) => this.getPenaltyFromPoint(island, a) - this.getPenaltyFromPoint(island, b));
	}

	public findPath(end: IVector3): NavigationPath | undefined {
		const mapInfo = this.maps.get(end.z);
		if (!mapInfo) {
			return undefined;
		}

		if (mapInfo.dirtyDijkstra) {
			// map is out of date. sync it now
			if (this.originUpdateTimeout !== undefined) {
				window.clearTimeout(this.originUpdateTimeout);
				this.originUpdateTimeout = undefined;
			}

			this.updateOrigin();
		}

		const response: IDijkstraMapFindPathResult = {
			success: false,
			path: [],
			score: 0,
			endX: end.x,
			endY: end.y,
		};

		mapInfo.dijkstraMap.findPath2(response);

		if (response.success) {
			// path has the end node at index 0 and the start node at (length - 1)
			// normally we would reverse the array, but I path find from end to start instead of start to end
			return {
				path: response.path.map<IVector3>(node => ({
					x: node.x,
					y: node.y,
					z: end.z,
				})),
				score: response.score,
			};
		}

		return undefined;
	}

	private isDisabled(island: Island, tile: ITile, x: number, y: number, z: number, tileType: TerrainType, skipCache?: boolean): boolean {
		if (!skipCache) {
			const cacheId = `${x},${y},${z}`;
			const result = this.nodeDisableCache.get(cacheId);
			if (result !== undefined) {
				return result;
			}
		}

		if (tileType === TerrainType.Void) {
			return true;
		}

		if (tile.npc !== undefined && tile.npc !== this.human) {
			return true;
		}

		const doodad = tile.doodad;
		if (doodad !== undefined) {
			const description = doodad.description();
			if (!description) {
				return true;
			}

			if (!description.isDoor &&
				!description.isGate &&
				!description.isWall &&
				!description.isTree &&
				(doodad.blocksMove() || doodad.isDangerous(this.human)) &&
				!doodad.isVehicle()) {
				return true;
			}
		}

		if (tile.creature && tile.creature.isTamed() && !tile.creature.canSwapWith(this.human, undefined)) {
			return true;
		}

		const players = island.getPlayersAtPosition(x, y, z, false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (player !== this.human) {
					return true;
				}
			}
		}

		return false;
	}

	private getPenalty(island: Island, tile: ITile, x: number, y: number, z: number, tileType: TerrainType, terrainDescription: ITerrainDescription, tileUpdateType?: TileUpdateType, skipCache?: boolean): number {
		if (!skipCache) {
			const cacheId = `${x},${y},${z}`;
			const result = this.nodePenaltyCache.get(cacheId);
			if (result !== undefined) {
				return result;
			}
		}

		let penalty = 0;

		if (tileType === TerrainType.Lava || tile.events?.some(tileEvent => tileEvent.type === TileEventType.Fire || tileEvent.type === TileEventType.Acid)) {
			penalty += 150;
		}

		if (tileType === TerrainType.CaveEntrance) {
			penalty += 255;
		}

		if (tileUpdateType === undefined || tileUpdateType === TileUpdateType.Creature || tileUpdateType === TileUpdateType.CreatureSpawn) {
			if (tile.creature) {
				// the penalty has to be high enough for non-tamed creatures to make the player not want to nav to it to avoid simple other obstacles
				penalty += tile.creature.isTamed() ? 10 : 120;
			}

			// penalty for creatures on or near the tile
			for (let x = -creaturePenaltyRadius; x <= creaturePenaltyRadius; x++) {
				for (let y = -creaturePenaltyRadius; y <= creaturePenaltyRadius; y++) {
					const point = island.ensureValidPoint({ x: x + x, y: y + y, z: z });
					if (point) {
						const creature = island.getTileFromPoint(point).creature;

						// only apply the penalty if the creature can actually go this tile
						if (creature && !creature.isTamed() && creature.checkCreatureMove(true, x, y, z, tile, creature.getMoveType(), true) === 0) {
							penalty += 10;

							if (x === 0 && y === 0) {
								penalty += 8;
							}

							if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
								penalty += 8;
							}

							if (creature.aberrant) {
								penalty += 100;
							}
						}
					}
				}
			}
		}

		if (tile.doodad !== undefined) {
			const description = tile.doodad.description();
			if (description && !description.isDoor && !description.isGate) {
				if (description.isWall) {
					// walls are hard to pick up and we don't want to
					penalty += 200;

				} else if (tile.doodad.blocksMove()) {
					// a gather doodad - large penalty
					penalty += 50;

				} else {
					penalty += 4;
				}
			}
		}

		if (terrainDescription.gather) {
			// rocks - large penalty
			penalty += 230;

		} else if (terrainDescription.shallowWater) {
			// stay away from coasts
			penalty += 6;

		} else if (terrainDescription.water && !this.sailingMode) {
			// stay out of water
			penalty += 20;
		}

		if (this.sailingMode && !terrainDescription.water && !terrainDescription.shallowWater) {
			// try to stay in water while sailing
			penalty += 200;
		}

		return Math.min(penalty, 255);
	}

	private _updateOrigin(x: number, y: number, z: number) {
		const mapInfo = this.maps.get(z);
		if (!mapInfo) {
			return;
		}

		mapInfo.dijkstraMap.updateOrigin(mapInfo.dijkstraMap.getNode(x, y));
		mapInfo.dirtyDijkstra = false;
	}

	private updateKdTree(x: number, y: number, z: number, tileType: number, navigationMapData: INavigationMapData | undefined = this.maps.get(z)) {
		if (!navigationMapData) {
			throw new Error("Invalid navigation info");
		}

		const point: IVector2 = { x, y };

		const kdTreeIndex = (y * game.mapSize) + x;
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
				navigationMapData.kdTrees.get(anyWaterTileLocation)?.add(point);

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

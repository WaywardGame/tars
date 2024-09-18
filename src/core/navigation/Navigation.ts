import type { IDijkstraMap, IDijkstraMapFindPathResult } from "@wayward/cplusplus/index";
import { TileUpdateType } from "@wayward/game/game/IGame";
import Human from "@wayward/game/game/entity/Human";
import Island from "@wayward/game/game/island/Island";
import type { ITerrainDescription } from "@wayward/game/game/tile/ITerrain";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import { TileEventType } from "@wayward/game/game/tile/ITileEvent";
import Tile from "@wayward/game/game/tile/Tile";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";
import Log from "@wayward/utilities/Log";
import WorldZ from "@wayward/utilities/game/WorldZ";

import { TarsOverlay } from "../../ui/TarsOverlay";
import { CreatureUtilities } from "../../utilities/CreatureUtilities";
import type { ITileLocation } from "../ITars";
import { ExtendedTerrainType, NavigationPath } from "./INavigation";
import { NavigationKdTrees } from "./NavigationKdTrees";
import Task from "@wayward/utilities/promise/Task";

interface INavigationMapData {
	dijkstraMap: IDijkstraMap;
	dirtyDijkstra: boolean;
}

export const tileUpdateRadius = 2;

export const creaturePenaltyRadius = 2;

export default class Navigation {

	private readonly maps: Map<number, INavigationMapData> = new Map();

	private readonly nodePenaltyCache: Map<number, number> = new Map();
	private readonly nodeDisableCache: Map<number, boolean> = new Map();

	private origin: Tile | undefined;
	private originUpdateTimeout: number | undefined;

	private oppositeOrigin: Tile | undefined;

	private sailingMode: boolean;

	private addedOverlays = false;

	constructor(
		private readonly log: Log,
		private readonly human: Human,
		private readonly creatureUtilities: CreatureUtilities,
		private readonly overlay: TarsOverlay,
		private readonly kdTrees: NavigationKdTrees) {
	}

	public load(): void {
		this.unload();

		this.origin = undefined;

		this.sailingMode = false;

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			try {
				const data: INavigationMapData = {
					dijkstraMap: new Module.DijkstraMap(this.human.island.mapSize),
					dirtyDijkstra: true,
				};

				this.maps.set(z, data);

			} catch (ex) {
				this.log.error("Failed to create dijkstraMap", ex);
				this.maps.delete(z);
			}
		}
	}

	public unload(): void {
		for (const mapInfo of this.maps.values()) {
			try {
				mapInfo.dijkstraMap.delete();

			} catch (ex) {
				this.log.error(`Failed to delete dijkstra map: ${ex}`);
			}
		}

		this.maps.clear();

		this.nodePenaltyCache.clear();
		this.nodeDisableCache.clear();

		if (this.originUpdateTimeout !== undefined) {
			window.clearTimeout(this.originUpdateTimeout);
			this.originUpdateTimeout = undefined;
		}
	}

	public shouldUpdateSailingMode(sailingMode: boolean): boolean {
		return this.sailingMode !== sailingMode;
	}

	public async updateAll(sailingMode: boolean, getBaseTiles: () => Set<Tile>): Promise<void> {
		this.log.info("Updating navigation. Please wait...");

		this.sailingMode = sailingMode;

		const island = this.human.island;

		const start = performance.now();

		await this.kdTrees.initializeIsland(island);

		const baseTiles = getBaseTiles();

		const task = new Task();
		for (const tile of Object.values(island.tiles)) {
			if (tile) {
				this.onTileUpdate(tile, tile.type, baseTiles.has(tile));
			}

			// prevent freezing while this is being initialized
			task.yield();
		}

		// update tiles around creatures
		for (const creature of island.creatures) {
			if (creature) {
				for (let x = -creaturePenaltyRadius; x <= creaturePenaltyRadius; x++) {
					for (let y = -creaturePenaltyRadius; y <= creaturePenaltyRadius; y++) {
						const tile = island.getTileSafe(creature.x + x, creature.y + y, creature.z);
						if (tile) {
							this.onTileUpdate(tile, tile.type, baseTiles.has(tile), TileUpdateType.Creature);
						}
					}
				}
			}
		}

		const time = performance.now() - start;

		this.log.info(`Updated navigation in ${time}ms`);
	}

	public async ensureOverlays(getBaseTiles: () => Set<Tile>): Promise<void> {
		if (this.addedOverlays) {
			return;
		}

		this.addedOverlays = true;

		const baseTiles = getBaseTiles();

		for (const tile of Object.values(this.human.island.tiles)) {
			if (tile) {
				this.refreshOverlay(tile, baseTiles.has(tile));
			}
		}
	}

	public getOrigin(): Tile | undefined {
		return this.origin;
	}

	public queueUpdateOrigin(origin?: Tile): void {
		if (origin) {
			this.origin = origin;
		}

		if (this.originUpdateTimeout === undefined) {
			this.originUpdateTimeout = window.setTimeout(() => {
				this.originUpdateTimeout = undefined;
				this.updateOrigin();
			}, 10);
		}
	}

	public updateOrigin(origin?: Tile): void {
		if (origin) {
			this.origin = origin;
		}

		if (!this.origin) {
			// throw new Error("Invalid origin");
			// this.queueUpdateOrigin();
			return;
		}

		this._updateOrigin(this.origin.x, this.origin.y, this.origin.z);

		const oppositeZ = this.oppositeZ;
		if (oppositeZ === undefined) {
			return;
		}

		// update the origin in the opposite z to be the location of the closest point of access (cave entrance)

		const nearestCaveEntrances = this.getNearestTileLocation(this.human.island, TerrainType.CaveEntrance, this.origin);
		const nearestCaveEntrance = nearestCaveEntrances[0];
		if (nearestCaveEntrance) {
			const { x, y } = nearestCaveEntrance.tile;

			if (this.oppositeOrigin && this.oppositeOrigin.x === x && this.oppositeOrigin.y === y && this.oppositeOrigin.z === oppositeZ) {
				// cave entrance is the same location as last time
				return;
			}

			this.oppositeOrigin = this.human.island.getTile(x, y, oppositeZ);

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

	public getOppositeOrigin(): Tile | undefined {
		return this.oppositeOrigin;
	}

	/**
	 * Returns the origin for the opposite the provided z
	 */
	public calculateOppositeOrigin(z: WorldZ): Tile | undefined {
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
			case WorldZ.Surface:
				return WorldZ.Cave;

			case WorldZ.Cave:
				return WorldZ.Surface;
		}

		return undefined;
	}

	public refreshOverlay(tile: Tile,
		isBaseTile: boolean,
		isDisabled?: boolean,
		penalty?: number,
		tileType: TerrainType | undefined = tile.type,
		terrainDescription: ITerrainDescription | undefined = tile.description,
		tileUpdateType?: TileUpdateType): void {
		if (!this.addedOverlays && this.overlay.isHidden) {
			return;
		}

		this.overlay.addOrUpdate(
			tile,
			isBaseTile,
			isDisabled ?? this.isDisabled(tile, tileType),
			penalty ?? this.getPenalty(tile, tileType, terrainDescription, tileUpdateType));
	}

	public onTileUpdate(
		tile: Tile,
		tileType: TerrainType,
		isBaseTile: boolean,
		tileUpdateType?: TileUpdateType): void {
		const mapInfo = this.maps.get(tile.z);
		if (!mapInfo) {
			return;
		}

		const terrainDescription = tile.description;
		if (!terrainDescription) {
			return;
		}

		const isDisabled = this.isDisabled(tile, tileType, true);
		const penalty = this.getPenalty(tile, tileType, terrainDescription, tileUpdateType, true);

		this.nodeDisableCache.set(tile.id, isDisabled);
		this.nodePenaltyCache.set(tile.id, penalty);

		this.refreshOverlay(tile, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);

		try {
			mapInfo.dirtyDijkstra = true;
			mapInfo.dijkstraMap.updateNode(tile.x, tile.y, penalty, isDisabled);
		} catch (ex) {
			this.log.trace("invalid node", tile.x, tile.y, penalty, isDisabled);
		}

		this.queueUpdateOrigin();
	}

	public getNearestTileLocation(island: Island, tileType: ExtendedTerrainType, point: IVector3): ITileLocation[] {
		// const start = performance.now();
		const kdTree = this.kdTrees.getKdTree(island, point.z, tileType);
		if (!kdTree) {
			return [];
		}

		const nearestPoints = kdTree.nearestPoints(point, 5);

		return nearestPoints.map(np => {
			const nearestPoint = {
				...np.point,
				z: point.z,
			};

			const tile = island.getTileFromPoint(nearestPoint);
			if (!tile) {
				throw new Error(`Invalid point ${nearestPoint.x},${nearestPoint.y}`);
			}

			return {
				type: tileType,
				tile,
			} as ITileLocation;
		});
	}

	public isDisabledFromPoint(island: Island, point: IVector3): boolean {
		const tile = island.getTileSafe(point.x, point.y, point.z);
		if (!tile) {
			return true;
		}

		const tileType = tile.type;

		return this.isDisabled(tile, tileType);
	}

	public getPenaltyFromPoint(island: Island, point: IVector3, tile: Tile = island.getTileFromPoint(point)): number {
		const tileType = tile.type;
		const terrainDescription = tile.description;
		if (!terrainDescription) {
			return 0;
		}

		return this.getPenalty(tile, tileType, terrainDescription);
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

	public findPath(end: IVector3, moveAdjacentToTarget: boolean): NavigationPath | undefined {
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
			moveAdjacentToTarget,
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

	public isDisabled(tile: Tile, tileType: TerrainType = tile.type, skipCache?: boolean): boolean {
		if (!skipCache) {
			const result = this.nodeDisableCache.get(tile.id);
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
			const description = doodad.description;
			if (!description) {
				return true;
			}

			if (!description.isDoor &&
				!description.isGate &&
				!description.isWall &&
				!description.isTree &&
				(doodad.blocksMove || doodad.isDangerous(this.human)) &&
				!doodad.isVehicle) {
				return true;
			}
		}

		if (tile.creature && tile.creature.isTamed && !tile.creature.canSwapWith(this.human, undefined)) {
			return true;
		}

		if (tile.isDeepHole) {
			return true;
		}

		const players = tile.getPlayersOnTile();
		if (players.length > 0) {
			for (const player of players) {
				if (player !== this.human) {
					return true;
				}
			}
		}

		return false;
	}

	public getPenalty(tile: Tile, tileType: TerrainType = tile.type, terrainDescription: ITerrainDescription | undefined = tile.description, tileUpdateType?: TileUpdateType, skipCache?: boolean): number {
		if (!skipCache) {
			const result = this.nodePenaltyCache.get(tile.id);
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

		if (tileUpdateType === TileUpdateType.Creature || tileUpdateType === TileUpdateType.CreatureSpawn) {
			if (tile.creature) {
				// the penalty has to be high enough for non-tamed creatures to make the player not want to nav to it to avoid simple other obstacles
				penalty += tile.creature.isTamed ? 10 : 120;
			}

			// penalty for creatures on or near the tile
			const otherTiles = tile.tilesInRange(creaturePenaltyRadius, true);
			for (const otherTile of otherTiles) {
				const creature = otherTile.creature;
				if (creature) {
					if (creature && !creature.isTamed) {
						penalty += 10;

						// check if the creature can move to this tile or the adjacent one
						let creatureCanMoveToAdjacentTile = false;

						const adjacentTiles = tile.getTilesAround();
						for (const adjacentTile of adjacentTiles) {
							if (creature.findPath(undefined, adjacentTile, creature.getMoveType(), creaturePenaltyRadius * 2, this.human) !== undefined) {
								creatureCanMoveToAdjacentTile = true;
								break;
							}
						}

						if (creatureCanMoveToAdjacentTile) {
							if (tile === otherTile) {
								penalty += 8;
							}

							if (Math.abs(tile.x - otherTile.x) <= 1 && Math.abs(tile.y - otherTile.y) <= 1) {
								penalty += 8;
							}

							if (creature.aberrant) {
								penalty += 100;
							}

							if (this.creatureUtilities.isScaredOfCreature(this.human, creature)) {
								penalty += 255;
							}
						}
					}
				}
			}
		}

		if (tile.doodad !== undefined) {
			const description = tile.doodad.description;
			if (description && !description.isDoor && !description.isGate) {
				if (description.isWall) {
					// walls are hard to pick up and we don't want to
					penalty += 200;

				} else if (tile.doodad.blocksMove) {
					// a gather doodad - large penalty
					penalty += 50;

				} else {
					penalty += 4;
				}
			}
		}

		if (terrainDescription) {
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
		}

		return Math.min(penalty, 255);
	}

	private _updateOrigin(x: number, y: number, z: number): void {
		const mapInfo = this.maps.get(z);
		if (!mapInfo) {
			return;
		}

		mapInfo.dijkstraMap.updateOrigin(mapInfo.dijkstraMap.getNode(x, y));
		mapInfo.dirtyDijkstra = false;
	}

}

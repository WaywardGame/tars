import type { IDijkstraMap, IDijkstraMapFindPathResult } from "@cplusplus/index";
import type { ITerrainDescription, ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import { TileEventType } from "game/tile/ITileEvent";
import terrainDescriptions from "game/tile/Terrains";
import { WorldZ } from "game/WorldZ";
import Enums from "utilities/enum/Enums";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import { sleep } from "utilities/promise/Async";
import { TileUpdateType } from "game/IGame";

import type { ITileLocation } from "../ITars";
import type { IGetTileLocationsRequest, IGetTileLocationsResponse, IUpdateAllTilesRequest, IUpdateAllTilesResponse, IUpdateTileRequest, NavigationPath, NavigationRequest, NavigationResponse } from "./INavigation";
import { NavigationMessageType } from "./INavigation";
import { TarsOverlay } from "../../ui/TarsOverlay";
import Human from "game/entity/Human";
import Log from "utilities/Log";

interface INavigationWorker {
	id: number;
	worker: Worker;
	busy: boolean;
	pendingRequests: Record<number, Array<{ request: NavigationRequest; resolve(response: NavigationResponse): void }>>;
}

const workerCount = 1; // navigator.hardwareConcurrency;

export const tileUpdateRadius = 2;

export const creaturePenaltyRadius = 2;

export default class Navigation {

	private static modPath: string;

	// public totalTime = 0;
	// public totalCount = 0;

	private readonly maps: Map<number, { dijkstraMap: IDijkstraMap; dirty: boolean }> = new Map();

	private readonly navigationWorkers: INavigationWorker[] = [];

	private origin: IVector3 | undefined;
	private originUpdateTimeout: number | undefined;

	private oppositeOrigin: IVector3 | undefined;

	private sailingMode: boolean;
	private workerInitialized: boolean;

	public static setModPath(modPath: string) {
		Navigation.modPath = modPath;
	}

	constructor(private readonly log: Log, private readonly human: Human, private readonly overlay: TarsOverlay) {
	}

	public load() {
		this.unload();

		this.origin = undefined;

		this.sailingMode = false;
		this.workerInitialized = false;

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			try {
				this.maps.set(z, {
					dijkstraMap: new Module.DijkstraMap(),
					dirty: true,
				});
			} catch (ex) {
				this.log.error("Failed to create dijkstraMap", ex);
				this.maps.delete(z);
			}
		}

		const freshWaterTypes: TerrainType[] = [];
		const seaWaterTypes: TerrainType[] = [];
		const gatherableTypes: TerrainType[] = [];

		for (const tileType of Enums.values(TerrainType)) {
			const tileTypeName = TerrainType[tileType];

			const terrainDescription = terrainDescriptions[tileType];
			if (!terrainDescription || terrainDescription.ice) {
				continue;
			}

			if (tileTypeName.includes("FreshWater")) {
				freshWaterTypes.push(tileType);

			} else if (tileTypeName.includes("Seawater")) {
				seaWaterTypes.push(tileType);
			}

			if (terrainDescription.gather) {
				gatherableTypes.push(tileType);
			}
		}

		let pathPrefix: string;
		try {
			pathPrefix = steamworks.getAppPath();
		} catch (ex) {
			const slashesCount = (Navigation.modPath.match(/\//g) || []).length;

			pathPrefix = "..\\..\\..\\..\\";

			for (let i = 0; i < slashesCount; i++) {
				pathPrefix += "..\\";
			}
		}

		let navigationWorkerPath = `${Navigation.modPath}\\out\\core\\navigation\\NavigationWorker.js`;

		if (isWebWorker) {
			// escape the web worker
			navigationWorkerPath = `..\\..\\..\\..\\${navigationWorkerPath}`;
		}

		for (let i = 0; i < workerCount; i++) {
			const worker = new Worker(navigationWorkerPath);

			this.navigationWorkers[i] = {
				id: i,
				worker: worker,
				busy: false,
				pendingRequests: {},
			};

			worker.onmessage = (event: MessageEvent) => {
				this.onWorkerMessage(this.navigationWorkers[i], event);
			};

			worker.postMessage({
				pathPrefix: pathPrefix,
				mapSize: game.mapSize,
				mapSizeSq: game.mapSizeSq,
				freshWaterTypes,
				seaWaterTypes,
				gatherableTypes,
			});
		}

		this.log.info(`Created ${workerCount} navigation workers`);
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

		for (const navigationWorker of this.navigationWorkers) {
			navigationWorker.worker.terminate();
		}

		this.navigationWorkers.length = 0;

		this.overlay.clear();

		if (this.originUpdateTimeout !== undefined) {
			window.clearTimeout(this.originUpdateTimeout);
			this.originUpdateTimeout = undefined;
		}
	}

	public shouldUpdateSailingMode(sailingMode: boolean) {
		return this.sailingMode !== sailingMode;
	}

	public async updateAll(sailingMode: boolean): Promise<void> {
		this.log.info("Updating navigation. Please wait...");

		this.sailingMode = sailingMode;

		const skipWorkerUpdate = this.workerInitialized;

		const array = !skipWorkerUpdate ? new Uint8Array(game.mapSizeSq * this.maps.size * 3) : undefined;

		const island = this.human.island;

		const start = performance.now();

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			for (let x = 0; x < game.mapSize; x++) {
				for (let y = 0; y < game.mapSize; y++) {
					const tile = island.getTile(x, y, z);
					this.onTileUpdate(tile, TileHelpers.getType(tile), x, y, z, false, array, undefined, skipWorkerUpdate);
				}
			}
		}

		if (array) {
			const promises: Array<Promise<NavigationResponse>> = [];

			for (const navigationWorker of this.navigationWorkers) {
				const messageArray = new Uint8Array(array.buffer.slice(0));

				const updateAllTilesMessage: IUpdateAllTilesRequest = {
					type: NavigationMessageType.UpdateAllTiles,
					array: messageArray,
				};

				promises.push(this.submitRequest(updateAllTilesMessage, navigationWorker.id, [messageArray.buffer]));
			}

			await Promise.all(promises);

			this.workerInitialized = true;
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

	public async updateOrigin(origin?: IVector3) {
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

		const nearestCaveEntrances = await this.getNearestTileLocation(TerrainType.CaveEntrance, this.origin);
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

		// const updateOriginMessage: IUpdateOriginRequest = {
		// 	type: NavigationMessageType.UpdateOrigin,
		// 	origin: this.origin,
		// };

		// for (const navigationWorker of this.navigationWorkers) {
		// 	navigationWorker.worker.postMessage(updateOriginMessage);
		// }
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

	public refreshOverlay(tile: ITile, x: number, y: number, z: number, isBaseTile: boolean, isDisabled?: boolean, penalty?: number, tileType?: number, terrainDescription?: ITerrainDescription, tileUpdateType?: TileUpdateType) {
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
			isDisabled ?? this.isDisabled(tile, x, y, z, tileType),
			penalty ?? this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType));
	}

	public onTileUpdate(tile: ITile, tileType: TerrainType, x: number, y: number, z: number, isBaseTile: boolean, array?: Uint8Array, tileUpdateType?: TileUpdateType, skipWorkerUpdate?: boolean): void {
		const mapInfo = this.maps.get(z);
		if (!mapInfo) {
			return;
		}

		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return;
		}

		const isDisabled = this.isDisabled(tile, x, y, z, tileType);
		const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType);

		this.refreshOverlay(tile, x, y, z, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);

		try {
			mapInfo.dirty = true;
			mapInfo.dijkstraMap.updateNode(x, y, penalty, isDisabled);
			// const node = dijkstraMapInstance.getNode(x, y);
			// node.penalty = penalty;
			// node.disabled = isDisabled;
		} catch (ex) {
			this.log.trace("invalid node", x, y, penalty, isDisabled);
		}

		if (array) {
			const index = (z * game.mapSizeSq * 3) + (y * game.mapSize * 3) + x * 3;
			array[index] = isDisabled ? 1 : 0;
			array[index + 1] = penalty;
			array[index + 2] = tileType;

		} else if (!skipWorkerUpdate) {
			const updateTileMessage: IUpdateTileRequest = {
				type: NavigationMessageType.UpdateTile,
				pos: { x, y, z },
				disabled: isDisabled,
				penalty: penalty,
				tileType: tileType,
			};

			for (const navigationWorker of this.navigationWorkers) {
				navigationWorker.worker.postMessage(updateTileMessage);
			}

			this.queueUpdateOrigin();
		}
	}

	public async getNearestTileLocation(tileType: TerrainType, point: IVector3): Promise<ITileLocation[]> {
		const getTileLocationsMessage: IGetTileLocationsRequest = {
			type: NavigationMessageType.GetTileLocations,
			tileType: tileType,
			pos: { x: point.x, y: point.y, z: point.z },
		};

		// const start = performance.now();

		const response = await this.submitRequest(getTileLocationsMessage);

		// const time = performance.now() - start;

		// this.totalTime += time;
		// this.totalCount++;

		// console.this.log.info("this.totalTime", this.totalTime);

		return response.result.map(p => {
			const nearestPoint = {
				...p,
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

	public isDisabledFromPoint(point: IVector3): boolean {
		if (!this.human.island.ensureValidPoint(point)) {
			return true;
		}

		const tile = this.human.island.getTileFromPoint(point);
		const tileType = TileHelpers.getType(tile);

		return this.isDisabled(tile, point.x, point.y, point.z, tileType);
	}

	public getPenaltyFromPoint(point: IVector3, tile: ITile = this.human.island.getTileFromPoint(point)): number {
		const tileType = TileHelpers.getType(tile);
		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return 0;
		}

		return this.getPenalty(tile, point.x, point.y, point.z, tileType, terrainDescription);
	}

	public getValidPoints(point: IVector3, moveAdjacentToTarget: boolean): IVector3[] {
		if (!moveAdjacentToTarget) {
			return !this.isDisabledFromPoint(point) ? [point] : [];
		}

		// "point" is disabled. we should nav to a neighbor tile instead
		const points: IVector3[] = [];

		let neighbor = { x: point.x + 1, y: point.y, z: point.z };
		if (!this.isDisabledFromPoint(neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x - 1, y: point.y, z: point.z };
		if (!this.isDisabledFromPoint(neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x, y: point.y + 1, z: point.z };
		if (!this.isDisabledFromPoint(neighbor)) {
			points.push(neighbor);
		}

		neighbor = { x: point.x, y: point.y - 1, z: point.z };
		if (!this.isDisabledFromPoint(neighbor)) {
			points.push(neighbor);
		}

		return points.sort((a, b) => this.getPenaltyFromPoint(a) - this.getPenaltyFromPoint(b));
	}

	public async findPath(end: IVector3): Promise<NavigationPath | undefined> {
		// const start = performance.now();

		// const response = await this.submitRequest(request);

		const mapInfo = this.maps.get(end.z);
		if (!mapInfo) {
			return undefined;
		}

		if (mapInfo.dirty) {
			// map is out of date. sync it now
			if (this.originUpdateTimeout !== undefined) {
				window.clearTimeout(this.originUpdateTimeout);
				this.originUpdateTimeout = undefined;
			}

			await this.updateOrigin();
		}

		const response: IDijkstraMapFindPathResult = {
			success: false,
			path: [],
			score: 0,
			endX: end.x,
			endY: end.y,
		};

		mapInfo.dijkstraMap.findPath2(response);

		// console.this.log.info("delta", time, response.elapsedTime);

		// this.totalTime += time; //response.elapsedTime;
		// this.totalCount++;

		// this.log.info(`Find path time: ${time.toFixed(2)}ms`, end, response.path ? response.path.length : "failure");

		if (response.success) {
			// this.log.info(`Total length: ${response.path.length}. Score: ${response.score}. Distance from start: ${Math.round(Vector2.distance(this.human.getPoint(), response.path[response.path.length - 1]))}`);

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

	private onWorkerMessage(navigationWorker: INavigationWorker, event: MessageEvent) {
		const data: NavigationResponse = event.data;

		const pendingRequests = navigationWorker.pendingRequests[data.type];
		if (!pendingRequests || pendingRequests.length === 0) {
			this.log.info(`No pending requests for ${NavigationMessageType[data.type]}`, data);
			return;
		}

		let resolve: ((response: NavigationResponse) => void) | undefined;

		switch (data.type) {
			case NavigationMessageType.UpdateAllTiles:
				resolve = pendingRequests.pop()!.resolve;
				break;

			case NavigationMessageType.GetTileLocations:
				for (let i = 0; i < pendingRequests.length; i++) {
					const info = pendingRequests[i];
					const pos = (info.request as IGetTileLocationsRequest).pos;
					if (pos.x === data.pos.x && pos.y === data.pos.y && pos.z === data.pos.z) {
						resolve = info.resolve;
						pendingRequests.splice(i, 1);
						break;
					}
				}

				break;
		}

		if (resolve) {
			resolve(data);

		} else {
			this.log.warn(`No matching request for ${NavigationMessageType[data.type]}`, data);
		}
	}

	private async submitRequest(request: IUpdateAllTilesRequest, targetWorkerId?: number, transfer?: Transferable[]): Promise<IUpdateAllTilesResponse>;
	private async submitRequest(request: IGetTileLocationsRequest, targetWorkerId?: number, transfer?: Transferable[]): Promise<IGetTileLocationsResponse>;
	private async submitRequest(request: NavigationRequest, targetWorkerId?: number, transfer?: Transferable[]): Promise<NavigationResponse> {
		if (targetWorkerId === undefined) {
			for (const navigationWorker of this.navigationWorkers) {
				if (!navigationWorker.busy) {
					targetWorkerId = navigationWorker.id;
					break;
				}
			}
		}

		if (targetWorkerId === undefined) {
			await sleep(1);

			return this.submitRequest(request as any, targetWorkerId, transfer);
		}

		const navigationWorker = this.navigationWorkers[targetWorkerId];
		navigationWorker.busy = true;

		if (!navigationWorker.pendingRequests[request.type]) {
			navigationWorker.pendingRequests[request.type] = [];
		}

		const response = await new Promise<NavigationResponse>(resolve2 => {
			navigationWorker.pendingRequests[request.type].push({ request, resolve: resolve2 });

			if (transfer) {
				navigationWorker.worker.postMessage(request, transfer);

			} else {
				navigationWorker.worker.postMessage(request);
			}
		});

		navigationWorker.busy = false;

		return response;
	}

	private isDisabled(tile: ITile, x: number, y: number, z: number, tileType: TerrainType): boolean {
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

		const players = this.human.island.getPlayersAtPosition(x, y, z, false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (player !== this.human) {
					return true;
				}
			}
		}

		return false;
	}

	private getPenalty(tile: ITile, tileX: number, tileY: number, tileZ: number, tileType: TerrainType, terrainDescription: ITerrainDescription, tileUpdateType?: TileUpdateType): number {
		let penalty = 0;

		if (tileType === TerrainType.Lava || tile.events?.some(tileEvent => tileEvent.type === TileEventType.Fire || tileEvent.type === TileEventType.Acid)) {
			penalty += 150;
		}

		if (tileType === TerrainType.CaveEntrance) {
			penalty += 255;
		}

		if (tileUpdateType === undefined || tileUpdateType === TileUpdateType.Creature || tileUpdateType === TileUpdateType.CreatureSpawn) {
			if (tile.creature) {
				// the penalty has to be high enough to make the player not want to nav to it to avoid simple other obstacles
				penalty += 120;
			}

			// penalty for creatures on or near the tile
			for (let x = -creaturePenaltyRadius; x <= creaturePenaltyRadius; x++) {
				for (let y = -creaturePenaltyRadius; y <= creaturePenaltyRadius; y++) {
					const point = this.human.island.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
					if (point) {
						const creature = this.human.island.getTileFromPoint(point).creature;

						// only apply the penalty if the creature can actually go this tile
						if (creature && !creature.isTamed() && creature.checkCreatureMove(true, tileX, tileY, tileZ, tile, creature.getMoveType(), true) === 0) {
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
		mapInfo.dirty = false;
	}
}

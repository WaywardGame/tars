import { IDijkstraMap, IDijkstraMapFindPathResult } from "@cplusplus/index";
import { IOverlayInfo, ITerrainDescription, ITile, OverlayType, TerrainType } from "game/tile/ITerrain";
import { TileEventType } from "game/tile/ITileEvent";
import terrainDescriptions from "game/tile/Terrains";
import { WorldZ } from "game/WorldZ";
import Enums from "utilities/enum/Enums";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import { sleep } from "utilities/promise/Async";
import { TileUpdateType } from "game/IGame";

import { log } from "../../utilities/Logger";

import { IGetTileLocationsRequest, IGetTileLocationsResponse, IUpdateAllTilesRequest, IUpdateAllTilesResponse, IUpdateTileRequest, NavigationMessageType, NavigationPath, NavigationRequest, NavigationResponse } from "./INavigation";
import { ITileLocation } from "../ITars";

interface INavigationWorker {
	id: number;
	worker: Worker;
	busy: boolean;
	pendingRequests: { [index: number]: Array<{ request: NavigationRequest; resolve(response: NavigationResponse): void }> };
}

const workerCount = 1; // navigator.hardwareConcurrency;

export const tileUpdateRadius = 2;

export const creaturePenaltyRadius = 2;

export default class Navigation {

	private static instance: Navigation | undefined;

	private static modPath: string;

	public totalTime = 0;
	public totalCount = 0;
	public overlayAlpha = 0;

	private readonly dijkstraMaps: Map<number, IDijkstraMap> = new Map();

	private readonly navigationWorkers: INavigationWorker[] = [];

	private readonly overlay: Map<string, IOverlayInfo> = new Map();

	private origin: IVector3;

	private originUpdateTimeout: number | undefined;

	private sailingMode = false;

	private workerInitialized = false;

	public static get(): Navigation {
		if (!Navigation.instance) {
			Navigation.instance = new Navigation();
			log.info("Created navigation instance");
		}

		return Navigation.instance;
	}

	public static delete(): void {
		if (Navigation.instance) {
			Navigation.instance.delete();
			Navigation.instance = undefined;
			log.info("Deleted navigation instance");
		}
	}

	public static setModPath(modPath: string) {
		Navigation.modPath = modPath;
	}

	constructor() {
		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			try {
				this.dijkstraMaps.set(z, new Module.DijkstraMap());
			} catch (ex) {
				log.error("Failed to create dijkstraMap", ex);
				this.dijkstraMaps.delete(z);
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

		log.info(`Creating ${workerCount} navigation workers`);

		for (let i = 0; i < workerCount; i++) {
			const worker = new Worker(`${Navigation.modPath}\\out\\core\\navigation\\NavigationWorker.js`);

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
	}

	public delete() {
		for (const dijkstraMap of this.dijkstraMaps.values()) {
			try {
				dijkstraMap.delete();

			} catch (ex) {
				log.error(`Failed to delete dijkstra map: ${ex}`);
			}
		}

		this.dijkstraMaps.clear();

		for (const navigationWorker of this.navigationWorkers) {
			navigationWorker.worker.terminate();
		}

		this.navigationWorkers.length = 0;

		this.deleteOverlay();
	}

	public showOverlay() {
		this.updateOverlayAlpha(150);
	}

	public hideOverlay() {
		this.updateOverlayAlpha(0);
	}

	public deleteOverlay() {
		if (localIsland) {
			for (const [key, overlay] of this.overlay.entries()) {
				const [x, y, z] = key.split(",");
				TileHelpers.Overlay.remove(localIsland.getTile(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)), overlay);
			}
		}

		this.overlay.clear();
	}

	public updateOverlayAlpha(alpha: number) {
		this.overlayAlpha = alpha;

		for (const [, overlay] of this.overlay.entries()) {
			overlay.alpha = this.overlayAlpha;
		}
	}

	public shouldUpdateSailingMode(sailingMode: boolean) {
		return this.sailingMode !== sailingMode;
	}

	public async updateAll(sailingMode: boolean): Promise<void> {
		log.info("Updating navigation. Please wait...");

		this.sailingMode = sailingMode;

		const skipWorkerUpdate = this.workerInitialized;

		const array = !skipWorkerUpdate ? new Uint8Array(game.mapSizeSq * this.dijkstraMaps.size * 3) : undefined;

		const start = performance.now();

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			for (let x = 0; x < game.mapSize; x++) {
				for (let y = 0; y < game.mapSize; y++) {
					const tile = localIsland.getTile(x, y, z);
					this.onTileUpdate(tile, TileHelpers.getType(tile), x, y, z, array, undefined, skipWorkerUpdate);
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

		log.info(`Updated navigation in ${time}ms`);
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

		const dijkstraMapInstance = this.dijkstraMaps.get(this.origin.z);
		if (!dijkstraMapInstance) {
			return;
		}

		dijkstraMapInstance.updateOrigin(dijkstraMapInstance.getNode(this.origin.x, this.origin.y));

		// const updateOriginMessage: IUpdateOriginRequest = {
		// 	type: NavigationMessageType.UpdateOrigin,
		// 	origin: this.origin,
		// };

		// for (const navigationWorker of this.navigationWorkers) {
		// 	navigationWorker.worker.postMessage(updateOriginMessage);
		// }
	}

	public onTileUpdate(tile: ITile, tileType: TerrainType, x: number, y: number, z: number, array?: Uint8Array, tileUpdateType?: TileUpdateType, skipWorkerUpdate?: boolean): void {
		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return;
		}

		const dijkstraMapInstance = this.dijkstraMaps.get(z);
		if (!dijkstraMapInstance) {
			return;
		}

		const isDisabled = this.isDisabled(tile, x, y, z, tileType);
		const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType);

		this.addOrUpdateOverlay(tile, x, y, z, isDisabled, penalty);

		try {
			const node = dijkstraMapInstance.getNode(x, y);
			node.penalty = penalty;
			node.disabled = isDisabled;
		} catch (ex) {
			log.error("invalid node", x, y, penalty, isDisabled);
			// tslint:disable-next-line: no-console
			console.trace();
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

		// console.log.info("this.totalTime", this.totalTime);

		return response.result.map(p => {
			const nearestPoint = {
				...p,
				z: point.z,
			};

			const tile = localIsland.getTileFromPoint(nearestPoint);
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
		if (!localIsland.ensureValidPoint(point)) {
			return true;
		}

		const tile = localIsland.getTileFromPoint(point);
		const tileType = TileHelpers.getType(tile);

		return this.isDisabled(tile, point.x, point.y, point.z, tileType);
	}

	public getPenaltyFromPoint(point: IVector3, tile: ITile = localIsland.getTileFromPoint(point)): number {
		const tileType = TileHelpers.getType(tile);
		const terrainDescription = terrainDescriptions[tileType];
		if (!terrainDescription) {
			return 0;
		}

		return this.getPenalty(tile, point.x, point.y, point.z, tileType, terrainDescription);
	}

	public getValidPoints(point: IVector3, onlyIncludePoint: boolean): IVector3[] {
		if (onlyIncludePoint && !this.isDisabledFromPoint(point)) {
			return [point];
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

		const dijkstraMap = this.dijkstraMaps.get(end.z);
		if (!dijkstraMap) {
			return undefined;
		}

		const response: IDijkstraMapFindPathResult = {
			success: false,
			path: [],
			score: 0,
			endX: end.x,
			endY: end.y,
		};

		dijkstraMap.findPath2(response);

		// console.log.info("delta", time, response.elapsedTime);

		// this.totalTime += time; //response.elapsedTime;
		// this.totalCount++;

		// log.info(`Find path time: ${time.toFixed(2)}ms`, end, response.path ? response.path.length : "failure");

		if (response.path !== undefined && response.score !== undefined) {
			// log.info(`Total length: ${response.path.length}. Score: ${response.score}. Distance from start: ${Math.round(Vector2.distance(localPlayer.getPoint(), response.path[response.path.length - 1]))}`);

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
			log.info(`No pending requests for ${NavigationMessageType[data.type]}`, data);
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
			log.warn(`No matching request for ${NavigationMessageType[data.type]}`, data);
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
		if (tile.npc !== undefined) {
			return true;
		}

		if (tile.doodad !== undefined) {
			const description = tile.doodad.description();
			if (!description) {
				return true;
			}

			if (!description.isDoor &&
				!description.isGate &&
				!description.isWall &&
				!description.isTree &&
				(tile.doodad.blocksMove() || tile.doodad.isDangerous(localPlayer))) {
				return true;
			}
		}

		if (tile.creature && tile.creature.isTamed() && !tile.creature.canSwapWith(localPlayer, undefined)) {
			return true;
		}

		const players = localIsland.getPlayersAtPosition(x, y, z, false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (!player.isLocalPlayer()) {
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
			// penalty for creatures on or near the tile
			for (let x = -creaturePenaltyRadius; x <= creaturePenaltyRadius; x++) {
				for (let y = -creaturePenaltyRadius; y <= creaturePenaltyRadius; y++) {
					const point = localIsland.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
					if (point) {
						const creature = localIsland.getTileFromPoint(point).creature;
						if (creature && !creature.isTamed()) {
							penalty += 20;

							if (x === 0 && y === 0) {
								penalty += 16;
							}

							if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
								penalty += 16;
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
					penalty += 15;

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

	private addOrUpdateOverlay(tile: ITile, tileX: number, tileY: number, tileZ: number, isDisabled: boolean, penalty: number) {
		const key = `${tileX},${tileY},${tileZ}`;

		let overlay = this.overlay.get(key);
		if (overlay) {
			TileHelpers.Overlay.remove(tile, overlay);
		}

		if (isDisabled || penalty !== 0) {
			overlay = {
				type: OverlayType.Arrows,
				size: 16,
				offsetX: 0,
				offsetY: 48,
				red: isDisabled ? 0 : Math.min(penalty, 255),
				green: isDisabled ? 0 : 255,
				blue: 0,
				alpha: this.overlayAlpha,
			};

			this.overlay.set(key, overlay);

			TileHelpers.Overlay.add(tile, overlay);

		} else if (overlay) {
			this.overlay.delete(key);
		}
	}
}

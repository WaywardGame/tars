import { DoodadType, TerrainType, WorldZ } from "Enums";
import { ITerrainDescription, ITile } from "tile/ITerrain";
import { TileEventType } from "tile/ITileEvent";
import Terrains from "tile/Terrains";
import { IVector2, IVector3 } from "utilities/math/IVector";
import Promise2 from "utilities/promise/ResolvablePromise";
import TileHelpers from "utilities/TileHelpers";
import * as Helpers from "./Helpers";
import { IFindPathMessage, IUpdateTileMessage, NavigationMessageType } from "./INavigation";
import { ITileLocation } from "./ITars";
import { log } from "./Utilities/Logger";
import { isWalkToTileBlocked } from "creature/Pathing";
import Vector2 from "utilities/math/Vector2";

export const seawaterTileLocation = -1;
export const freshWaterTileLocation = -2;
export const anyWaterTileLocation = -3;

export class Navigation {

	private navigationWorker: Worker;

	constructor() {
		const modPath = Helpers.getPath();

		let pathPrefix: string;
		try {
			pathPrefix = steamworks.getAppPath();
		} catch (ex) {
			const slashesCount = (modPath.match(/\//g) || []).length;

			pathPrefix = "../../";
			for (let i = 0; i < slashesCount; i++) {
				pathPrefix += "../";
			}
		}

		this.navigationWorker = new Worker(`${modPath}/out/NavigationWorker.js`);
		this.navigationWorker.postMessage(pathPrefix);
	}

	public delete() {
		this.navigationWorker.terminate();
	}

	public updateAll(): Promise<void> {
		log("Updating navigation. Please wait...");

		const zs = 2;

		const array = new Uint8Array(game.mapSize * game.mapSize * zs * 3);

		const start = performance.now();

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			for (let x = 0; x < game.mapSize; x++) {
				for (let y = 0; y < game.mapSize; y++) {
					const tile = game.getTile(x, y, z);
					this.onTileUpdate(tile, TileHelpers.getType(tile), x, y, z, array);
				}
			}
		}

		const updateAllTilesMessage: IUpdateAllTilesMessage = {
			type: NavigationMessageType.UpdateAllTiles,
			array: array
		};
		this.navigationWorker.postMessage(updateAllTilesMessage, [array.buffer]);

		return new Promise((resolve) => {
			this.navigationWorker.onmessage = (event: MessageEvent) => {
				const time = performance.now() - start;
		
				log(`Updated navigation in ${time}ms`);
				
				resolve();
			}
		});
	}

	public onTileUpdate(tile: ITile, tileType: TerrainType, x: number, y: number, z: number, array?: Uint8Array): void {
		const terrainDescription = Terrains[tileType];
		if (!terrainDescription) {
			return;
		}

		const isDisabled = this.isDisabled(tile, x, y, z, tileType, terrainDescription);
		const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription);

		if (array) {
			const index = (z * game.mapSize * game.mapSize * 3) + (y * game.mapSize * 3) + x * 3;
			array[index] = isDisabled ? 1 : 0;
			array[index + 1] = penalty;
			array[index + 2] = tileType;

		} else {
			const updateTileMessage: IUpdateTileMessage = {
				type: NavigationMessageType.UpdateTile,
				x: x,
				y: y,
				z: z,
				disabled: isDisabled,
				penalty: penalty,
				tileType: tileType
			};
			this.navigationWorker.postMessage(updateTileMessage);
		}
	}

	public async getNearestTileLocation(tileType: TerrainType, point: IVector3): Promise<ITileLocation[]> {
		// const now = performance.now();

		const getTileLocationsMessage: IGetTileLocationsMessage = {
			type: NavigationMessageType.GetTileLocations,
			tileType: tileType,
			x: point.x,
			y: point.y,
			z: point.z
		};

		const promise2 = new Promise2<ITileLocation[]>();

		this.navigationWorker.onmessage = (event: MessageEvent) => {
			// const time = performance.now() - now;
			// log(`Get nearest tile location time: ${time.toFixed(2)}ms`);

			const tileLocations = event.data as IVector2[];

			promise2.resolve(tileLocations.map(p => {
				const nearestPoint = {
					...p,
					z: point.z
				};

				return {
					type: tileType,
					point: nearestPoint,
					tile: game.getTileFromPoint(nearestPoint)
				};
			}));
		};

		this.navigationWorker.postMessage(getTileLocationsMessage);

		return promise2;
	}

	public getValidPoints(point: IVector3, includePoint: boolean): IVector3[] {
		if (includePoint && !this.isDisabledFromPoint(point)) {
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

		return points.sort((a, b) => {
			const penaltyA = this.getPenaltyFromPoint(a);
			const penaltyB = this.getPenaltyFromPoint(b);
			if (penaltyA === penaltyB) {
				return 0;
			}

			return penaltyA > penaltyB ? 1 : -1;
		});
	}

	public async findPath(start: IVector3, end: IVector3): Promise<IVector3[] | undefined> {
		const now = performance.now();

		const findPathMessage: IFindPathMessage = {
			type: NavigationMessageType.FindPath,
			startX: start.x,
			startY: start.y,
			endX: end.x,
			endY: end.y,
			z: start.z
		};

		const promise2 = new Promise2<IVector3[] | undefined>();

		this.navigationWorker.onmessage = (event: MessageEvent) => {
			const time = performance.now() - now;
			log(`Find path time: ${time.toFixed(2)}ms`);

			const path = event.data as (IVector2[] | undefined);
			if (path) {
				const pathPoints = path.map<IVector3>(node => ({
					x: node.x,
					y: node.y,
					z: start.z
				}));

				log(`Total length: ${pathPoints.length}. Distance from current position: ${Math.round(Vector2.distance(localPlayer, pathPoints[pathPoints.length - 1]))}`);

				// path has the end node at index 0 and the start node at (length - 1)
				// normally we would reverse the array, but I pathfind from end to start instead of start to end
				promise2.resolve(pathPoints);

			} else {
				promise2.resolve(undefined);
			}
		};

		this.navigationWorker.postMessage(findPathMessage);

		return promise2;
	}

	private isDisabledFromPoint(point: IVector3): boolean {
		const tile = game.getTileFromPoint(point);

		const tileType = TileHelpers.getType(tile);
		const terrainDescription = Terrains[tileType];
		if (!terrainDescription) {
			return false;
		}

		return this.isDisabled(tile, point.x, point.y, point.z, tileType, terrainDescription);
	}

	private getPenaltyFromPoint(point: IVector3): number {
		const tile = game.getTileFromPoint(point);

		const tileType = TileHelpers.getType(tile);
		const terrainDescription = Terrains[tileType];
		if (!terrainDescription) {
			return 0;
		}

		return this.getPenalty(tile, point.x, point.y, point.z, tileType, terrainDescription);
	}

	private isDisabled(tile: ITile, x: number, y: number, z: number, tileType: TerrainType, terrainDescription: ITerrainDescription): boolean {
		return isWalkToTileBlocked(localPlayer, tile, { x, y }, false);
	}

	private getPenalty(tile: ITile, x: number, y: number, z: number, tileType: TerrainType, terrainDescription: ITerrainDescription): number {
		let penalty = 0;

		const terrainType = TileHelpers.getType(tile);
		if (terrainType === TerrainType.Lava || tileEventManager.get(tile, TileEventType.Fire)) {
			penalty += 12;
		}

		if (tile.doodad !== undefined && tile.doodad.type !== DoodadType.WoodenDoor && tile.doodad.type !== DoodadType.WoodenDoorOpen) {
			if (tile.doodad.blocksMove()) {
				// a gather doodad - large penalty
				penalty += 12;

			} else {
				penalty += 4;
			}
		}

		if (terrainDescription.gather) {
			// rocks - large penalty
			penalty += 16;
		}

		// stay away from coasts
		if (terrainDescription.shallowWater) {
			penalty += 6;

		} else if (terrainDescription.water) {
			penalty += 20;
		}

		return penalty;
	}
}

let instance: Navigation | undefined;

export function getNavigation(): Navigation {
	if (!instance) {
		instance = new Navigation();
	}

	return instance;
}

export function deleteNavigation(): void {
	if (instance) {
		instance.delete();
		instance = undefined;
	}
}

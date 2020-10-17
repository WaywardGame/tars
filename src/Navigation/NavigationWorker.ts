
interface IVector2 {
	x: number;
	y: number;
}

interface IVector3 extends IVector2 {
	z: number;
}

/////////////////////////////
// Copied from INavigation (with export keyword removed)

enum NavigationMessageType {
	UpdateAllTiles,
	UpdateTile,
	GetTileLocations,
}

interface INavigationRequestBase {
	type: NavigationMessageType;
}

interface INavigationResponseBase {
	type: NavigationMessageType;
}

interface IUpdateAllTilesRequest extends INavigationRequestBase {
	type: NavigationMessageType.UpdateAllTiles;
	array: Uint8Array;
}

interface IUpdateAllTilesResponse extends INavigationResponseBase {
	type: NavigationMessageType.UpdateAllTiles;
}

interface IUpdateTileRequest extends INavigationRequestBase {
	type: NavigationMessageType.UpdateTile;
	pos: IVector3;
	disabled: boolean;
	penalty: number;
	tileType: number;
}

interface IGetTileLocationsRequest extends INavigationRequestBase {
	type: NavigationMessageType.GetTileLocations;
	tileType: number;
	pos: IVector3;
}

interface IGetTileLocationsResponse extends INavigationResponseBase {
	type: NavigationMessageType.GetTileLocations;
	pos: IVector3;
	result: IVector2[];
	elapsedTime: number;
}

type NavigationRequest = IUpdateAllTilesRequest | IUpdateTileRequest | IGetTileLocationsRequest;

enum TerrainType {
	DeepSeawater = 0,
	Seawater = 1,
	ShallowSeawater = 2,
	DeepFreshWater = 3,
	FreshWater = 4,
	ShallowFreshWater = 5,
	FreezingFreshWater = 41,
	FreezingSeawater = 43,
}

enum WorldZ {
	Min = 0,
	Max = 1,
	Cave = 0,
	Overworld = 1,
}

const freshWaterTileLocation = -1;
const anyWaterTileLocation = -2;

let mapSize: number;
let mapSizeSq: number;

/////////////////////////////

interface INavigationInfo {
	tileLocations: { [index: number]: IKDTree };
	kdTreeTileTypes: Uint8Array;
}

class Navigation {

	private readonly navigationInfo: { [index: number]: INavigationInfo } = {};

	constructor() {
		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			this.navigationInfo[z] = {
				tileLocations: {},
				kdTreeTileTypes: new Uint8Array(mapSizeSq),
			};
		}
	}

	public processMessage(message: NavigationRequest) {
		let response: any;

		switch (message.type) {
			case NavigationMessageType.UpdateAllTiles:
				response = this.updateAllTiles(message);
				break;

			case NavigationMessageType.UpdateTile:
				this.updateTile(message);
				break;

			case NavigationMessageType.GetTileLocations:
				response = this.getTileLocations(message);
				break;
		}

		if (response) {
			(self.postMessage as any)(response);
		}
	}

	private updateAllTiles(message: IUpdateAllTilesRequest): IUpdateAllTilesResponse {
		const array = message.array;

		for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
			const navigationInfo = this.navigationInfo[z];
			if (!navigationInfo) {
				continue;
			}

			navigationInfo.tileLocations[freshWaterTileLocation] = new Module.KDTree();
			navigationInfo.tileLocations[anyWaterTileLocation] = new Module.KDTree();

			for (let x = 0; x < mapSize; x++) {
				for (let y = 0; y < mapSize; y++) {
					const index = (z * mapSizeSq * 3) + (y * mapSize * 3) + x * 3;

					const isDisabled = array[index];
					const penalty = array[index + 1];
					const tileType = array[index + 2];

					this._updateTile(x, y, z, isDisabled ? true : false, penalty, tileType, navigationInfo);
				}
			}
		}

		return {
			type: NavigationMessageType.UpdateAllTiles,
		};
	}

	private updateTile(message: IUpdateTileRequest) {
		this._updateTile(message.pos.x, message.pos.y, message.pos.z, message.disabled, message.penalty, message.tileType);
	}

	private getTileLocations(message: IGetTileLocationsRequest): IGetTileLocationsResponse {
		const navigationInfo = this.navigationInfo[message.pos.z];

		const start = performance.now();

		const tileLocationTree = navigationInfo.tileLocations[message.tileType];

		const result = tileLocationTree ? tileLocationTree.nearestPoints(message.pos.x, message.pos.y) : [];

		const time = performance.now() - start;

		return {
			type: NavigationMessageType.GetTileLocations,
			pos: message.pos,
			result: result,
			elapsedTime: time,
		};
	}

	private _updateTile(x: number, y: number, z: number, disabled: boolean, penalty: number, tileType: number, navigationInfo: INavigationInfo = this.navigationInfo[z]) {
		if (!navigationInfo) {
			throw new Error("Invalid navigation info");
		}

		const kdTreeIndex = (y * mapSize) + x;
		let kdTreeTileType = navigationInfo.kdTreeTileTypes[kdTreeIndex];

		if (kdTreeTileType !== 0) {
			kdTreeTileType--;

			if (kdTreeTileType === tileType) {
				return;
			}

			// tile type changed

			navigationInfo.tileLocations[kdTreeTileType].deletePoint(x, y);

			this.updateWaterTiles(navigationInfo, kdTreeTileType, x, y, false);
		}

		navigationInfo.kdTreeTileTypes[kdTreeIndex] = tileType + 1;

		if (!navigationInfo.tileLocations[tileType]) {
			navigationInfo.tileLocations[tileType] = new Module.KDTree();
		}

		navigationInfo.tileLocations[tileType].insertPoint(x, y);

		this.updateWaterTiles(navigationInfo, tileType, x, y, true);
	}

	private updateWaterTiles(navigationInfo: INavigationInfo, tileType: TerrainType, x: number, y: number, insert: boolean) {
		const isFreshWater = tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreezingFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater;
		const isSeawater = tileType === TerrainType.ShallowSeawater || tileType === TerrainType.FreezingSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater;

		if (isFreshWater || isSeawater) {
			if (insert) {
				navigationInfo.tileLocations[anyWaterTileLocation].insertPoint(x, y);

			} else {
				navigationInfo.tileLocations[anyWaterTileLocation].deletePoint(x, y);
			}

			if (isFreshWater) {
				if (insert) {
					navigationInfo.tileLocations[freshWaterTileLocation].insertPoint(x, y);

				} else {
					navigationInfo.tileLocations[freshWaterTileLocation].deletePoint(x, y);
				}
			}
		}
	}
}

const webWorkerSelf = self;
let queuedMessages: NavigationRequest[] | undefined;

// @ts-ignore
function WaywardPlusPlusLoaded() {
	// console.log("[TARS] Navigation Worker WaywardPlusPlusLoaded");

	const navigation = new Navigation();

	if (queuedMessages) {
		for (const message of queuedMessages) {
			navigation.processMessage(message);
		}

		queuedMessages = undefined;
	}

	webWorkerSelf.onmessage = (event: MessageEvent) => {
		navigation.processMessage(event.data);
	};
}

// the initial message will send the path
webWorkerSelf.onmessage = (event: MessageEvent) => {
	if (queuedMessages) {
		queuedMessages.push(event.data);
		return;
	}

	queuedMessages = [];

	const pathPrefix = event.data.pathPrefix;

	mapSize = event.data.mapSize;
	mapSizeSq = event.data.mapSizeSq;

	// Fix emscripten loading
	const oldFetch = fetch;

	self.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
		input = `${pathPrefix}\\static\\js\\wayward.wasm`;
		return oldFetch(input, init);
	};

	importScripts(`${pathPrefix}\\static\\js\\wayward.js`);
};

/////////////////////////////
// Copied from INavigation (with export keyword removed)

enum NavigationMessageType {
	UpdateAllTiles,
	UpdateTile,
	FindPath,
	GetTileLocations
}

interface INavigationMessageBase {
	type: NavigationMessageType;
}

interface IUpdateAllTilesMessage extends INavigationMessageBase {
	type: NavigationMessageType.UpdateAllTiles;
	array: Uint8Array;
}

interface IUpdateTileMessage extends INavigationMessageBase {
	type: NavigationMessageType.UpdateTile;
	x: number;
	y: number;
	z: number;
	disabled: boolean;
	penalty: number;
	tileType: number;
}

interface IFindPathMessage extends INavigationMessageBase {
	type: NavigationMessageType.FindPath;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	z: number;
}

interface IGetTileLocationsMessage extends INavigationMessageBase {
	type: NavigationMessageType.GetTileLocations;
	tileType: number;
	x: number;
	y: number;
	z: number;
}

type NavigationMessage = IUpdateAllTilesMessage | IUpdateTileMessage | IFindPathMessage | IGetTileLocationsMessage;

enum TerrainType {
	DeepSeawater = 0,
	Seawater = 1,
	ShallowSeawater = 2,
	DeepFreshWater = 3,
	FreshWater = 4,
	ShallowFreshWater = 5
}

const seawaterTileLocation = -1;
const freshWaterTileLocation = -2;
const anyWaterTileLocation = -3;

/////////////////////////////

class NavigationInfo {
	navigationInstance: INavigation;
	tileLocations: { [index: number]: IKDTree };
	kdTreeTileTypes: Uint8Array;
}

class Navigation {

	private readonly navigationInfo: { [index: number]: NavigationInfo } = {};

	constructor() {
		for (let z = 0; z <= 1; z++) {
			this.navigationInfo[z] = {
				navigationInstance: new Module.Navigation(true),
				tileLocations: {},
				kdTreeTileTypes: new Uint8Array(512 * 512)
			};
		}
	}

	public processMessage(message: NavigationMessage) {
		switch (message.type) {
			case NavigationMessageType.UpdateAllTiles:
				this.updateAllTiles(message);
				break;

			case NavigationMessageType.UpdateTile:
				this.updateTile(message);
				break;

			case NavigationMessageType.FindPath:
				this.findPath(message);
				break;

			case NavigationMessageType.GetTileLocations:
				this.getTileLocations(message);
				break;
		}
	}

	private updateAllTiles(message: IUpdateAllTilesMessage) {
		const array = message.array;

		for (let z = 0; z <= 1; z++) {
			const navigationInfo = this.navigationInfo[z];
			if(!navigationInfo) {
				continue;
			}
			
			navigationInfo.tileLocations[seawaterTileLocation] = new Module.KDTree();
			navigationInfo.tileLocations[freshWaterTileLocation] = new Module.KDTree();
			navigationInfo.tileLocations[anyWaterTileLocation] = new Module.KDTree();

			for (let x = 0; x < 512; x++) {
				for (let y = 0; y < 512; y++) {
					const index = (z * 512 * 512 * 3) + (y * 512 * 3) + x * 3;

					const isDisabled = array[index];
					const penalty = array[index + 1];
					const tileType = array[index + 2];

					this._updateTile(x, y, z, isDisabled ? true : false, penalty, tileType, navigationInfo);
				}
			}
		}
		
		(self.postMessage as any)(undefined);
	}

	private updateTile(message: IUpdateTileMessage) {
		this._updateTile(message.x, message.y, message.z, message.disabled, message.penalty, message.tileType);
	}

	private findPath(message: IFindPathMessage) {
		const navigationInfo = this.navigationInfo[message.z];
		
		const startNode = navigationInfo.navigationInstance.getNode(message.startX, message.startY);
		const endNode = navigationInfo.navigationInstance.getNode(message.endX, message.endY);

		const path = navigationInfo.navigationInstance.findPath(startNode, endNode);
		if (path) {
			(self.postMessage as any)(path.map(node => ({ x: node.x, y: node.y })));

		} else {
			(self.postMessage as any)(undefined);
		}
	}

	private getTileLocations(message: IGetTileLocationsMessage) {
		const navigationInfo = this.navigationInfo[message.z];
		
		const tileLocationTree = navigationInfo.tileLocations[message.tileType];
		(self.postMessage as any)(tileLocationTree ? tileLocationTree.nearestPoint(message.x, message.y) : []);
	}

	private _updateTile(x: number, y: number, z: number, disabled: boolean, penalty: number, tileType: number, navigationInfo: NavigationInfo = this.navigationInfo[z]) {
		const node = navigationInfo.navigationInstance.getNode(x, y);
		node.disabled = disabled;
		node.penalty = penalty;

		const kdTreeIndex = (y * 512) + x;
		let kdTreeTileType = navigationInfo.kdTreeTileTypes[kdTreeIndex];

		let waterIndex: number | undefined;

		if (kdTreeTileType !== 0) {
			kdTreeTileType--;

			if (kdTreeTileType === tileType) {
				return;
			}

			navigationInfo.tileLocations[kdTreeTileType].deletePoint(x, y);

			waterIndex = Navigation.getTileLocationWaterIndex(kdTreeTileType);
			if (waterIndex !== undefined) {
				navigationInfo.tileLocations[waterIndex].deletePoint(x, y);
				navigationInfo.tileLocations[anyWaterTileLocation].deletePoint(x, y);
			}
		}

		navigationInfo.kdTreeTileTypes[kdTreeIndex] = tileType + 1;

		if (!navigationInfo.tileLocations[tileType]) {
			navigationInfo.tileLocations[tileType] = new Module.KDTree();
		}

		navigationInfo.tileLocations[tileType].insertPoint(x, y);

		waterIndex = Navigation.getTileLocationWaterIndex(tileType);
		if (waterIndex !== undefined) {
			navigationInfo.tileLocations[waterIndex].insertPoint(x, y);
			navigationInfo.tileLocations[anyWaterTileLocation].insertPoint(x, y);
		}
	}

	private static getTileLocationWaterIndex(tileType: TerrainType): number | undefined {
		if (tileType === TerrainType.ShallowSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater) {
			return seawaterTileLocation;

		} else if (tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater) {
			return freshWaterTileLocation;
		}

		return undefined;
	}
}

const webWorkerSelf = self;
let queuedMessages: NavigationMessage[] | undefined;

// @ts-ignore
function WaywardPlusPlusLoaded() {
	console.log("[TARS] Navigation Worker WaywardPlusPlusLoaded");

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

	} else {
		queuedMessages = [];
	}

	const pathPrefix = event.data as string;

	// Fix emscripten loading
	const oldFetch = fetch;

	self.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
		input = `${pathPrefix}/${input}`;
		return oldFetch(input, init);
	};

	importScripts(`${pathPrefix}/static/js/wayward.js`);
};

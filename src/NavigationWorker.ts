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
}

interface IGetTileLocationsMessage extends INavigationMessageBase {
	type: NavigationMessageType.GetTileLocations;
	tileType: number;
	x: number;
	y: number;
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

class Navigation {

	private readonly navigationInstance: INavigation;
	private readonly tileLocations: { [index: number]: IKDTree };
	private readonly kdTreeTileTypes: Uint8Array;

	constructor() {
		this.navigationInstance = new Module.Navigation(true);
		this.tileLocations = {};
		this.kdTreeTileTypes = new Uint8Array(512 * 512);
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
		this.tileLocations[seawaterTileLocation] = new Module.KDTree();
		this.tileLocations[freshWaterTileLocation] = new Module.KDTree();
		this.tileLocations[anyWaterTileLocation] = new Module.KDTree();

		const array = message.array;

		for (let x = 0; x < 512; x++) {
			for (let y = 0; y < 512; y++) {
				const index = (y * 512 * 3) + x * 3;

				const isDisabled = array[index];
				const penalty = array[index + 1];
				const tileType = array[index + 2];

				this._updateTile(x, y, isDisabled ? true : false, penalty, tileType);
			}
		}
	}

	private updateTile(message: IUpdateTileMessage) {
		this._updateTile(message.x, message.y, message.disabled, message.penalty, message.tileType);
	}

	private findPath(message: IFindPathMessage) {
		const startNode = this.navigationInstance.getNode(message.startX, message.startY);
		const endNode = this.navigationInstance.getNode(message.endX, message.endY);

		const path = this.navigationInstance.findPath(startNode, endNode);
		if (path) {
			(self.postMessage as any)(path.map(node => ({ x: node.x, y: node.y })));

		} else {
			(self.postMessage as any)(undefined);
		}
	}

	private getTileLocations(message: IGetTileLocationsMessage) {
		const tileLocationTree = this.tileLocations[message.tileType];
		(self.postMessage as any)(tileLocationTree ? tileLocationTree.nearestPoint(message.x, message.y) : []);
	}

	private getTileLocationWaterIndex(tileType: TerrainType): number | undefined {
		if (tileType === TerrainType.ShallowSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater) {
			return seawaterTileLocation;

		} else if (tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater) {
			return freshWaterTileLocation;
		}

		return undefined;
	}

	private _updateTile(x: number, y: number, disabled: boolean, penalty: number, tileType: number) {
		const node = this.navigationInstance.getNode(x, y);
		node.disabled = disabled;
		node.penalty = penalty;

		const kdTreeIndex = (y * 512) + x;
		let kdTreeTileType = this.kdTreeTileTypes[kdTreeIndex];

		let waterIndex: number | undefined;

		if (kdTreeTileType !== 0) {
			kdTreeTileType--;

			if (kdTreeTileType === tileType) {
				return;
			}

			this.tileLocations[kdTreeTileType].deletePoint(x, y);

			waterIndex = this.getTileLocationWaterIndex(kdTreeTileType);
			if (waterIndex !== undefined) {
				this.tileLocations[waterIndex].deletePoint(x, y);
				this.tileLocations[anyWaterTileLocation].deletePoint(x, y);
			}
		}

		this.kdTreeTileTypes[kdTreeIndex] = tileType + 1;

		if (!this.tileLocations[tileType]) {
			this.tileLocations[tileType] = new Module.KDTree();
		}

		this.tileLocations[tileType].insertPoint(x, y);

		waterIndex = this.getTileLocationWaterIndex(tileType);
		if (waterIndex !== undefined) {
			this.tileLocations[waterIndex].insertPoint(x, y);
			this.tileLocations[anyWaterTileLocation].insertPoint(x, y);
		}
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

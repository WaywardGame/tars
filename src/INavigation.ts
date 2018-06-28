export enum NavigationMessageType {
	UpdateAllTiles,
	UpdateTile,
	FindPath,
	GetTileLocations
}

export interface INavigationMessageBase {
	type: NavigationMessageType;
}

export interface IUpdateAllTilesMessage extends INavigationMessageBase {
	type: NavigationMessageType.UpdateAllTiles;
	array: Uint8Array;
}

export interface IUpdateTileMessage extends INavigationMessageBase {
	type: NavigationMessageType.UpdateTile;
	x: number;
	y: number;
	disabled: boolean;
	penalty: number;
	tileType: number;
}

export interface IFindPathMessage extends INavigationMessageBase {
	type: NavigationMessageType.FindPath;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export interface IGetTileLocationsMessage extends INavigationMessageBase {
	type: NavigationMessageType.GetTileLocations;
	tileType: number;
	x: number;
	y: number;
}

export type NavigationMessage = IUpdateAllTilesMessage | IUpdateTileMessage | IFindPathMessage | IGetTileLocationsMessage;

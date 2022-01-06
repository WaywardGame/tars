import type { IVector2, IVector3 } from "utilities/math/IVector";

export enum NavigationMessageType {
	UpdateAllTiles,
	UpdateTile,
	GetTileLocations,
}

export interface INavigationRequestBase {
	type: NavigationMessageType;
}

export interface INavigationResponseBase {
	type: NavigationMessageType;
}

export interface IUpdateAllTilesRequest extends INavigationRequestBase {
	type: NavigationMessageType.UpdateAllTiles;
	array: Uint8Array;
}

export interface IUpdateAllTilesResponse extends INavigationResponseBase {
	type: NavigationMessageType.UpdateAllTiles;
}

export interface IUpdateTileRequest extends INavigationRequestBase {
	type: NavigationMessageType.UpdateTile;
	pos: IVector3;
	disabled: boolean;
	penalty: number;
	tileType: number;
}

export interface IGetTileLocationsRequest extends INavigationRequestBase {
	type: NavigationMessageType.GetTileLocations;
	tileType: number;
	pos: IVector3;
}

export interface IGetTileLocationsResponse extends INavigationResponseBase {
	type: NavigationMessageType.GetTileLocations;
	pos: IVector3;
	result: IVector2[];
	elapsedTime: number;
}

export type NavigationRequest = IUpdateAllTilesRequest | IGetTileLocationsRequest;

export type NavigationResponse = IUpdateAllTilesResponse | IGetTileLocationsResponse;

export interface NavigationPath { path: IVector3[]; score: number }

export const freshWaterTileLocation = -1;

export const anyWaterTileLocation = -2;

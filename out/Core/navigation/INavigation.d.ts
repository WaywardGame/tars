import { IVector2, IVector3 } from "utilities/math/IVector";
export declare enum NavigationMessageType {
    UpdateAllTiles = 0,
    UpdateTile = 1,
    GetTileLocations = 2
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
export declare type NavigationRequest = IUpdateAllTilesRequest | IGetTileLocationsRequest;
export declare type NavigationResponse = IUpdateAllTilesResponse | IGetTileLocationsResponse;
export interface NavigationPath {
    path: IVector3[];
    score: number;
}
export declare const freshWaterTileLocation = -1;
export declare const anyWaterTileLocation = -2;

interface IVector2 {
    x: number;
    y: number;
}
interface IVector3 extends IVector2 {
    z: number;
}
declare enum NavigationMessageType {
    UpdateAllTiles = 0,
    UpdateTile = 1,
    GetTileLocations = 2
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
declare type NavigationRequest = IUpdateAllTilesRequest | IUpdateTileRequest | IGetTileLocationsRequest;
declare enum WorldZ {
    Min = 0,
    Max = 1,
    Cave = 0,
    Overworld = 1
}
declare type TerrainType = number;
declare const freshWaterTileLocation = -1;
declare const anyWaterTileLocation = -2;
declare const gatherableTileLocation = -3;
declare let mapSize: number;
declare let mapSizeSq: number;
declare let freshWaterTypes: Set<TerrainType>;
declare let seaWaterTypes: Set<TerrainType>;
declare let gatherableTypes: Set<TerrainType>;
interface INavigationInfo {
    tileLocations: Record<number, any>;
    kdTreeTileTypes: Uint8Array;
}
declare class Navigation {
    private readonly navigationInfo;
    constructor();
    processMessage(message: NavigationRequest): void;
    private updateAllTiles;
    private updateTile;
    private getTileLocations;
    private _updateTile;
    private updateSpecialTileTypes;
}
declare const webWorkerSelf: Window & typeof globalThis;
declare let queuedMessages: NavigationRequest[] | undefined;
declare function WaywardPlusPlusLoaded(): void;

import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import type { IVector3 } from "utilities/math/IVector";
import { TileUpdateType } from "game/IGame";
import type { ITileLocation } from "../ITars";
import type { NavigationPath } from "./INavigation";
export declare const tileUpdateRadius = 2;
export declare const creaturePenaltyRadius = 2;
export default class Navigation {
    private static modPath;
    totalTime: number;
    totalCount: number;
    overlayAlpha: number;
    private readonly dijkstraMaps;
    private readonly navigationWorkers;
    private readonly overlay;
    private origin;
    private originUpdateTimeout;
    private sailingMode;
    private workerInitialized;
    static setModPath(modPath: string): void;
    constructor();
    delete(): void;
    showOverlay(): void;
    hideOverlay(): void;
    deleteOverlay(): void;
    updateOverlayAlpha(alpha: number): void;
    shouldUpdateSailingMode(sailingMode: boolean): boolean;
    updateAll(sailingMode: boolean): Promise<void>;
    getOrigin(): IVector3;
    queueUpdateOrigin(origin?: IVector3): void;
    updateOrigin(origin?: IVector3): void;
    onTileUpdate(tile: ITile, tileType: TerrainType, x: number, y: number, z: number, array?: Uint8Array, tileUpdateType?: TileUpdateType, skipWorkerUpdate?: boolean): void;
    getNearestTileLocation(tileType: TerrainType, point: IVector3): Promise<ITileLocation[]>;
    isDisabledFromPoint(point: IVector3): boolean;
    getPenaltyFromPoint(point: IVector3, tile?: ITile): number;
    getValidPoints(point: IVector3, onlyIncludePoint: boolean): IVector3[];
    findPath(end: IVector3): Promise<NavigationPath | undefined>;
    private onWorkerMessage;
    private submitRequest;
    private isDisabled;
    private getPenalty;
    private addOrUpdateOverlay;
}

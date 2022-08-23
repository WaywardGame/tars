import type { ITerrainDescription, ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import type { IVector3 } from "utilities/math/IVector";
import { TileUpdateType } from "game/IGame";
import type { ITileLocation } from "../ITars";
import type { NavigationPath } from "./INavigation";
import { TarsOverlay } from "../../ui/TarsOverlay";
import Human from "game/entity/Human";
import Log from "utilities/Log";
export declare const tileUpdateRadius = 2;
export declare const creaturePenaltyRadius = 2;
export default class Navigation {
    private readonly log;
    private readonly human;
    private readonly overlay;
    private static modPath;
    private readonly maps;
    private readonly navigationWorkers;
    private origin;
    private originUpdateTimeout;
    private oppositeOrigin;
    private sailingMode;
    private workerInitialized;
    static setModPath(modPath: string): void;
    constructor(log: Log, human: Human, overlay: TarsOverlay);
    load(): void;
    unload(): void;
    shouldUpdateSailingMode(sailingMode: boolean): boolean;
    updateAll(sailingMode: boolean): Promise<void>;
    getOrigin(): IVector3 | undefined;
    queueUpdateOrigin(origin?: IVector3): void;
    updateOrigin(origin?: IVector3): Promise<void>;
    get oppositeZ(): number | undefined;
    getOppositeOrigin(): IVector3 | undefined;
    calculateOppositeOrigin(z: WorldZ): IVector3 | undefined;
    calculateOppositeZ(z: WorldZ): WorldZ | undefined;
    refreshOverlay(tile: ITile, x: number, y: number, z: number, isBaseTile: boolean, isDisabled?: boolean, penalty?: number, tileType?: number, terrainDescription?: ITerrainDescription, tileUpdateType?: TileUpdateType): void;
    onTileUpdate(tile: ITile, tileType: TerrainType, x: number, y: number, z: number, isBaseTile: boolean, array?: Uint8Array, tileUpdateType?: TileUpdateType, skipWorkerUpdate?: boolean): void;
    getNearestTileLocation(tileType: TerrainType, point: IVector3): Promise<ITileLocation[]>;
    isDisabledFromPoint(point: IVector3): boolean;
    getPenaltyFromPoint(point: IVector3, tile?: ITile): number;
    getValidPoints(point: IVector3, moveAdjacentToTarget: boolean): IVector3[];
    findPath(end: IVector3): Promise<NavigationPath | undefined>;
    private onWorkerMessage;
    private submitRequest;
    private isDisabled;
    private getPenalty;
    private _updateOrigin;
}

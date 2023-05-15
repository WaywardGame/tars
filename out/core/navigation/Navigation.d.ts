/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type { ITerrainDescription } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import type { IVector3 } from "utilities/math/IVector";
import { TileUpdateType } from "game/IGame";
import Human from "game/entity/Human";
import Log from "utilities/Log";
import Island from "game/island/Island";
import type { ITileLocation } from "../ITars";
import { ExtendedTerrainType, NavigationPath } from "./INavigation";
import { TarsOverlay } from "../../ui/TarsOverlay";
import { NavigationKdTrees } from "./NavigationKdTrees";
import Tile from "game/tile/Tile";
export declare const tileUpdateRadius = 2;
export declare const creaturePenaltyRadius = 2;
export default class Navigation {
    private readonly log;
    private readonly human;
    private readonly overlay;
    private readonly kdTrees;
    private readonly maps;
    private readonly nodePenaltyCache;
    private readonly nodeDisableCache;
    private origin;
    private originUpdateTimeout;
    private oppositeOrigin;
    private sailingMode;
    private addedOverlays;
    constructor(log: Log, human: Human, overlay: TarsOverlay, kdTrees: NavigationKdTrees);
    load(): void;
    unload(): void;
    shouldUpdateSailingMode(sailingMode: boolean): boolean;
    updateAll(sailingMode: boolean): Promise<void>;
    ensureOverlays(getBaseTiles: () => Set<Tile>): Promise<void>;
    getOrigin(): IVector3 | undefined;
    queueUpdateOrigin(origin?: IVector3): void;
    updateOrigin(origin?: IVector3): void;
    get oppositeZ(): number | undefined;
    getOppositeOrigin(): IVector3 | undefined;
    calculateOppositeOrigin(z: WorldZ): IVector3 | undefined;
    calculateOppositeZ(z: WorldZ): WorldZ | undefined;
    refreshOverlay(tile: Tile, isBaseTile: boolean, isDisabled?: boolean, penalty?: number, tileType?: TerrainType | undefined, terrainDescription?: ITerrainDescription | undefined, tileUpdateType?: TileUpdateType): void;
    onTileUpdate(tile: Tile, tileType: TerrainType, isBaseTile: boolean, tileUpdateType?: TileUpdateType): void;
    getNearestTileLocation(island: Island, tileType: ExtendedTerrainType, point: IVector3): ITileLocation[];
    isDisabledFromPoint(island: Island, point: IVector3): boolean;
    getPenaltyFromPoint(island: Island, point: IVector3, tile?: Tile): number;
    getValidPoints(island: Island, point: IVector3, moveAdjacentToTarget: boolean): IVector3[];
    findPath(end: IVector3): NavigationPath | undefined;
    isDisabled(tile: Tile, tileType?: TerrainType, skipCache?: boolean): boolean;
    getPenalty(tile: Tile, tileType?: TerrainType, terrainDescription?: ITerrainDescription | undefined, tileUpdateType?: TileUpdateType, skipCache?: boolean): number;
    private _updateOrigin;
}

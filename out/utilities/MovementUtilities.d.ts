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
import type { IVector3 } from "@wayward/game/utilities/math/IVector";
import Tile from "@wayward/game/game/tile/Tile";
import type Context from "../core/context/Context";
import type { NavigationPath } from "../core/navigation/INavigation";
import { ObjectiveResult } from "../core/objective/IObjective";
export declare enum MoveResult {
    NoTarget = 0,
    NoPath = 1,
    Moving = 2,
    Complete = 3
}
export declare class MovementUtilities {
    private movementOverlays;
    private readonly cachedPaths;
    private readonly cachedEnds;
    clearCache(): void;
    resetMovementOverlays(): void;
    clearOverlay(tile: Tile): void;
    updateOverlay(context: Context, path: IVector3[]): void;
    ensureOrigin(context: Context): void;
    getMovementEndPositions(context: Context, target: IVector3, moveAdjacentToTarget: boolean): IVector3[];
    getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean, reverse?: boolean): Promise<NavigationPath | ObjectiveResult.Complete | ObjectiveResult.Impossible>;
    private _getMovementPath;
    move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean, walkOnce?: boolean): Promise<MoveResult>;
}

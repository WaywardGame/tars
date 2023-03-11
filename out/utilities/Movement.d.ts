import type { IVector3 } from "utilities/math/IVector";
import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";
import type { NavigationPath } from "../core/navigation/INavigation";
import Tile from "game/tile/Tile";
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

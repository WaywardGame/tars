import type { ITile } from "game/tile/ITerrain";
import type { IVector2, IVector3 } from "utilities/math/IVector";
import type Context from "../core/context/Context";
export interface IMovementPath {
    difficulty: number;
    path?: IVector2[];
}
export declare enum MoveResult {
    NoTarget = 0,
    NoPath = 1,
    Moving = 2,
    Complete = 3
}
export declare class MovementUtilities {
    private movementOverlays;
    private readonly cachedPaths;
    clearCache(): void;
    resetMovementOverlays(): void;
    clearOverlay(tile: ITile): void;
    updateOverlay(path: IVector2[]): void;
    ensureOrigin(context: Context): Promise<void>;
    getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean, reverse?: boolean): Promise<IMovementPath>;
    private _getMovementPath;
    move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean, walkOnce?: boolean): Promise<MoveResult>;
}

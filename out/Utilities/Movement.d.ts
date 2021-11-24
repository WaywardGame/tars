import { ITile } from "game/tile/ITerrain";
import { IVector2, IVector3 } from "utilities/math/IVector";
import Context from "../Context";
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
declare class MovementUtilities {
    private movementOverlays;
    private cachedPaths;
    clearCache(): void;
    resetMovementOverlays(): void;
    clearOverlay(tile: ITile): void;
    updateOverlay(path: IVector2[]): void;
    getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean): Promise<IMovementPath>;
    moveToFaceTarget(context: Context, target: IVector3): Promise<MoveResult>;
    moveToTarget(context: Context, target: IVector3): Promise<MoveResult>;
    move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean, walkOnce?: boolean): Promise<MoveResult>;
}
export declare const movementUtilities: MovementUtilities;
export {};